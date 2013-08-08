/*!
 * Copyright (c) Wesley Hales
 * Available under MIT (see LICENSE)
 */

(function (window, document, undefined) {
  "use strict";
  window.onslyde = (function () {

    var options,

      onslyde = function (startupOptions) {
        options = startupOptions;
        return new onslyde.core.init();
      },

      panel = {sessionID: 0, mode: 'default'},
      panelRemote = {sessionID: 0, mode: 'default'},
      sessionID = 0;

    onslyde.core = onslyde.prototype = {
      constructor: onslyde,

      start: function () {

        try {
          if (options) {

            //setup all the options being passed in in the init
            panel = options.panel !== null ? options.panel : null;
            panelRemote = options.panelRemote !== null ? options.panelRemote : null;
          }
        } catch (e) {
          //alert('Problem with init. Check your options: ' + e);
        }

        onslyde.core.hideURLBar();

        if (panel && panel.sessionID) {
          sessionID = panel.sessionID;
          onslyde.panel.init();
        }

        if (panelRemote && panelRemote.sessionID) {
          sessionID = panelRemote.sessionID;
        }

      },

      hideURLBar: function () {
        //hide the url bar on mobile devices
        setTimeout(scrollTo, 0, 0, 1);
      },

      init: function () {

        window.addEventListener('load', function (e) {
          onslyde.core.start();
        }, false);


        return onslyde.core;

      },

      ajax: function (url, callback, async) {
        var req = init();
        req.onreadystatechange = processRequest;

        function init() {
          if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
          } else if (window.ActiveXObject) {
            return new window.ActiveXObject("Microsoft.XMLHTTP");
          }
        }

        function processRequest() {
          if (req.readyState === 4) {
            if (req.status === 200) {
              if (callback) {
                callback(req.responseText, url);
              }
            } else {
              // handle error
            }
          }
        }

        this.doGet = function () {
//          req.open("GET", url + "?timestamp=" + new Date().getTime(), async);
          req.open("GET", url, async);
          req.send(null);

        };

        this.doPost = function (body) {
          req.open("POST", url, async);
          req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
          req.send(body);
        };
      }
    };

    onslyde.core.init.prototype = onslyde.core;

    var ip = null, ws;
    var username;
    var isopen = false;
    onslyde.ws = onslyde.prototype = {

      ip: function (thisSessionID) {
        //todo come up with better approach :)
        //there are 3 environments in which this call must be made:
        //(1) running just HTML locally
        //(2) running the ws server and HTML locally
        //(3) prod where ip needs to be hard coded since we get ec2 private IP on this call

        var ai = new onslyde.core.ajax('/go/presenters/ip?session=' + thisSessionID, function (text, url) {
          if (location.host === 'onslyde.com') {
            //(3) - set proper IP if in prod
            //todo - even though we set the IP and don't use data from server, this http request bootstraps an internal piece on each connect
            ip = '107.22.176.73';
          } else {
            //(2) - set proper IP dynamically for locally running server
            ip = text;
          }

        }, false);

        //added one more exception for running node server on port 8001 :)
        //todo - this needs to be refactored with a whitelist for all 4 environments.
        if (ip === null && location.protocol !== "file:" && location.host !== 'localhost:8001') {
          //(3) and (2) make sure we make the ajax request
          ai.doGet();
        } else {
          //(1) HTML is running locally and we can't make ajax request until implement jsonp or CORS headers
          ip = '107.22.176.73';
        }

        return ip;
      },

      getip: function () {

        var createRandom = function () {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        var aip;
        var min = 255;
        var max = 999;
        if (!localStorage['onslyde.attendeeIP']) {
          aip = createRandom() + '.' + createRandom() + '.' + createRandom() + '.' + createRandom();
          localStorage['onslyde.attendeeIP'] = aip;
        } else {
          aip = localStorage['onslyde.attendeeIP'];
        }
        return aip;
      },

      sessionID: function(){return sessionID;},

      connect: function (websocket, initString, thisSessionID) {

        username = 'anonymous';
        //here we check to see if we're passing in our mock websocket object from polling clients (using gracefulWebSocket.js)
        console.log('connecting now', websocket);
        //if websocket doesn't exist, create one from spec
        if (!websocket) {
          if (!ip) {
            ip = this.ip(thisSessionID);
          }
          var location = 'ws://' + ip + ':8081/?session=' + thisSessionID + '&attendeeIP=' + this.getip();
          ws = new WebSocket(location);
        } else {
          //we sent end a mock object from jquery polling
          ws = websocket;
        }

        ws.onopen = function () {
          isopen = true;
           console.log('onopen',initString,typeof initString !== 'undefined')
          onslyde.ws._send('user:' + username);

          if (typeof initString !== 'undefined') {
            onslyde.ws._send(initString);
          }
        };
        ws.onmessage = this._onmessage;
        ws.onclose = this._onclose;

        return ws;
      },

      _onmessage: function (m) {
        if (m.data) {

          if (m.data.indexOf('sessionID":"' + sessionID) > 0) {
            try {
              //avoid use of eval...
              var event = (m.data);
              event = (new Function("return " + event))();
              event.onslydeEvent.fire();
            } catch (e) {
              console.log(e);
            }
          } else {

          }
        }
      },

      _onclose: function (m) {
        onslyde.ws._send('::disconnect::');
        ws = null;
      },

      _onerror: function (e) {
//        console.log(e);
      },

      _send: function (message) {
        //console.log('sent ');
        ws.send(message);

      }
    };

    var activeSlide,
      csessionID,
      activeOptions = [],
      wscount,
      pollcount,
      groupSlideIndex = 0,
      groupIndex = 0,
      currentVotes = {},
      totalVotes = 0,
      speakerList = [],
      currentSpeaker;

    onslyde.panel = onslyde.prototype = {

      init : function(thisSession) {

        //-----------begin event listeners
        window.addEventListener('clientVote', function (e) {
          onslyde.panel.optionVote(e.vote, activeSlide);
        }, false);

        window.addEventListener('updateCount', function(e) {
          onslyde.panel.updateDeck(e.wsCount,e.pollCount);
        }, false);

        window.addEventListener('speak', function(e) {
          var speaker = JSON.parse(e.name);
          onslyde.panel.queueSpeaker(speaker);
        }, false);

        window.addEventListener('clearRoute', function(e) {
          slidfast.slides.clearRoute();
        }, false);

        window.addEventListener('wtf', function(e) {
          var wtf = document.getElementById("wtf");
          wtf.innerHTML = "Thumbs Down!";
          if(wtf){
            wtf.className = "show-wtf transition";
            setTimeout(function(){wtf.className = "hide-wtf transition"},800)
          }
        }, false);

        window.addEventListener('nice', function(e) {
          var nice = document.getElementById("nice");
          nice.innerHTML = "Nice!";
          if(nice){
            nice.className = "show-nice nice transition";
            setTimeout(function(){nice.className = "hide-nice transition"},800)
          }
        }, false);
        //-----------end event listeners


        //start timer
        var timerHolder = document.getElementById('timer');
        var startsecond = 0;
        setInterval(function(){
          timerHolder.innerHTML = (new Date());
        },1000);


        this.connect('::connect::');
        setTimeout(function(){onslyde.panel.updateRemotes();},1000);

        document.getElementById('sessionID').innerHTML = sessionID;
      },

      connect : function(initString) {
        //ws connect
//        console.log('connect',initString);
        try {
          if (!ws) {
            onslyde.ws.connect(null, initString, sessionID);
          } else {
            onslyde.ws._send(initString, sessionID);
          }
        } catch (e) {
          console.log('error',e);
        }
      },

      updateDeck : function(wsc,pc) {
        wscount = wsc;
        pollcount = pc;
        document.getElementById('totalCount').innerHTML = (parseInt(wsc,10) + parseInt(pc,10));
      },

      queueSpeaker : function(speaker) {
        speakerList.push(speaker);
        console.log('speakerList',speakerList);
        var image = document.createElement('img');
        image.src = speaker.pic;
        image.onclick = function(){onslyde.panel.upNextSpeaker(speaker);};
        document.getElementById('speakerQueue').appendChild(image);
      },

      upNextSpeaker : function(speaker) {
        var image = document.createElement('img');
        image.src = speaker.pic;
        image.onclick = function(){onslyde.panel.speakerLive(speaker);};
        document.getElementById('upNext').appendChild(image);
        this.removeSpeaker(speaker.email);
      },

      speakerLive : function(speaker) {
        var image = document.createElement('img');
        image.src = speaker.pic;
        document.getElementById('currentSpeaker').innerHTML = '';
        document.getElementById('currentSpeaker').appendChild(image);
        //should we automatically move the next in the list to "up next"
        //for now just remove.
        document.getElementById('upNext').innerHTML = '';
      },

      removeSpeaker : function(email) {
        //removes speaker from queue
        for(var i=0;i < speakerList.length;i++){
          if(speakerList[i].email === email){
            speakerList.splice(i,1);
            console.log('removed speaker: ', email);
          }
        }
        console.log('speakerList after remove',speakerList);
        //todo - rebuild list - improve this
        document.getElementById('speakerQueue').innerHTML = '';

        for(var j=0;j < speakerList.length;j++){
          var image = document.createElement('img');
          image.src = speakerList[j].pic;
          console.log(speakerList[j])
          image.onclick = function(){onslyde.panel.upNextSpeaker(speakerList[j]);};
          document.getElementById('speakerQueue').appendChild(image);
        }

      },

      wsCount : function() {
        return wscount;
      },

      pollCount : function() {
        return pollcount;
      },

      sendMarkup : function() {
        // see if there's anything on the new slide to send to remotes EXPERIMENTAL
        if(activeSlide !== 'undefined'){
          for(var i = 0; i < activeSlide.querySelectorAll('.send').length;i++) {
            //send to remotes
            var outerHtml = activeSlide.querySelectorAll('.send')[i].outerHTML;
            outerHtml = outerHtml.replace(/'/g, "&#39;");
            var remoteMarkup = JSON.stringify({remoteMarkup : encodeURIComponent(outerHtml)});
            this.connect(remoteMarkup);
          }
        }
      },

      updateRemotes: function () {
        var activeOptionsString;

        if(activeOptions.length >= 1){
          activeOptionsString = 'activeOptions:' + activeOptions + ',' + groupIndex + ':' + groupSlideIndex;
        }else{
          activeOptionsString = 'activeOptions:null,null,' + groupIndex + ':' + groupSlideIndex;
        }
        console.log(activeOptionsString);
        this.connect(activeOptionsString);
        //clear options after sending
//        activeOptions = [];

      },

      roulette : function() {
        this.connect("roulette");
      },

      optionVote: function (vote, activeSlide) {
        //given vote for a default slide
        var index;
        //if(vote in activeOptions){
        index = activeOptions.indexOf(vote);
        if (vote in currentVotes) {
          currentVotes[vote] += 1;
          ////console.log(currentVotes);
        } else {
          currentVotes[vote] = 1;

        }
        //}
        ////console.log(vote + ' ' + currentVotes[vote]);

        for (var i = 0; i < activeOptions.length; i++) {
          if (currentVotes.hasOwnProperty(activeOptions[i]))
            totalVotes += currentVotes[activeOptions[i]];
        }

        barChart.vote(vote);
        barChart.redraw();
      },

      handleKeys: function (event) {
        switch (event.keyCode) {
          case 39: // right arrow
          case 13: // Enter
          case 32: // space
          case 34: // PgDn
            event.preventDefault();
            break;

          case 37: // left arrow
//          case 8: // Backspace
          case 33: // PgUp
            event.preventDefault();
            break;

          case 40: // down arrow
            event.preventDefault();
            break;

          case 38: // up arrow
            event.preventDefault();
            break;

          case 78: // N
            //document.body.classList.toggle('with-notes');
            break;

          case 27: // ESC
            //document.body.classList.remove('with-notes');
            break;
        }
      }

    };

    onslyde.html5e = onslyde.prototype = {
      /*jshint sub:true */
      supports_local_storage: function () {
        try {
          return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
          return false;
        }
      },

      supports_app_cache: function () {
        try {
          return 'applicationCache' in window && window['applicationCache'] !== null;
        } catch (e) {
          return false;
        }
      },
      //geolocation cannot be accessed with dot notation in iOS5... will prevent page caching
      supports_geolocation: function () {
        try {
          return 'geolocation' in navigator && navigator['geolocation'] !== null;
        } catch (e) {
          return false;
        }
      },

      supports_websocket: function () {
        try {
          return 'WebSocket' in window && window['WebSocket'] !== null;
        } catch (e) {
          return false;
        }
      },

      supports_orientation: function () {
        try {
          return 'DeviceOrientationEvent' in window && window['DeviceOrientationEvent'] !== null;
        } catch (e) {
          return false;
        }
      },

      supports_motion: function () {
        try {
          return 'DeviceMotionEvent' in window && window['DeviceMotionEvent'] !== null;
        } catch (e) {
          return false;
        }
      }

    };


    return onslyde;

  })();
})(window, document);


