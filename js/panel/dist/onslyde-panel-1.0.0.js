/*! onslyde - v0.0.1 - 2014-09-19
* Copyright (c) 2014 Wesley Hales; Licensed  */
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
        setTimeout(window.scrollTo, 0, 0, 1);
      },

      init: function () {

        window.addEventListener('load', function (e) {
          onslyde.core.start();
        }, false);


        return onslyde.core;

      },

      ajax: function (url, callback, async) {


        function init() {
          if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
          } else if (window.ActiveXObject) {
            return new window.ActiveXObject("Microsoft.XMLHTTP");
          }
        }

        var req = init();


        function processRequest() {
          if (req.readyState === 4 && req.status === 200) {

              if (callback) {
                callback(req.responseText, url);
              }

          } else {
            // handle error
          }
        }

        req.onreadystatechange = processRequest;

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

        var BASE_URL;
        if(location.host.indexOf('onslyde.com') >= 0){
          BASE_URL = 'https://www.onslyde.com:8443';
        }else{
          BASE_URL = 'https://127.0.0.1:8443';
        }

        //todo come up with better approach :)
        //there are 3 environments in which this call must be made:
        //(1) running just HTML locally
        //(2) running the ws server and HTML locally
        //(3) prod where ip needs to be hard coded since we get ec2 private IP on this call

        var ai = new onslyde.core.ajax(BASE_URL + '/go/presenters/ip?session=' + thisSessionID, function (text, url) {
          if (location.host === 'onslyde.com') {
            //(3) - set proper IP if in prod
            //todo - even though we set the IP and don't use data from server, this http request bootstraps an internal piece on each connect
            ip = 'www.onslyde.com';
          } else {
            //(2) - set proper IP dynamically for locally running server
            ip = text;
          }

        }, false);

        //added one more exception for running node server on port 8001 :)
        //todo - this needs to be refactored with a whitelist for all 4 environments.
        if (ip === null && location.protocol !== "file:" && location.host !== 'localhost:8001') {
          //(3) and (2) make sure we make the ajax request
//          ai.doGet();
          ip = 'www.onslyde.com';
        } else {
          //(1) HTML is running locally and we can't make ajax request until implement jsonp or CORS headers
          ip = 'www.onslyde.com';
        }

        return ip;
      },

      getip: function () {

        var createRandom = function () {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        };
        var aip;
        var min = 255;
        var max = 999;
        if (!localStorage['onslyde.attendeeIP']) {
          aip = createRandom() + '.' + createRandom() + '.' + createRandom() + '.' + createRandom();
          //if in private browsing mode this will fail
          try{
            localStorage['onslyde.attendeeIP'] = aip;
          }catch(e){

          }
        } else {
          aip = localStorage['onslyde.attendeeIP'];
        }
        return aip;
      },

      sessionID: function(){return sessionID;},

      connect: function (websocket, initString, thisSessionID) {

        username = 'anonymous';
        //here we check to see if we're passing in our mock websocket object from polling clients (using gracefulWebSocket.js)
//        console.log('connecting now', websocket);
        //if websocket doesn't exist, create one from spec
        if (!websocket) {
          if (!ip) {
            ip = this.ip(thisSessionID);
          }
          var location = 'wss://' + ip + '/ws/?session=' + thisSessionID + '&attendeeIP=' + this.getip();
          ws = new WebSocket(location);
        } else {
          //we sent in a mock object from jquery polling
          //still need to setup ip in localStorage
          this.getip();

          ws = websocket;
        }

        ws.onopen = function () {
          isopen = true;
          if (typeof initString !== 'undefined') {
            onslyde.ws._send(initString);
          }
        };
        ws.onmessage = this._onmessage;
        ws.onclose = this._onclose;
        ws.sendText = function(text){
          onslyde.ws._send(text);
        };
        return ws;
      },

      _onmessage: function (m) {
        /*jshint -W054 */
//        console.log('---onmessage:', m.data);
        if (m.data) {
          if(typeof m.data === 'object'){
            if(m.data.onslydeEvent.sessionID !== 0){
              m.data.onslydeEvent.fire();
            }
          }else if (m.data.indexOf('sessionID":"' + sessionID) > 0) {
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
        console.log('close it');
        ws = null;
      },

      _onerror: function (e) {
//        console.log(e);
      },

      _send: function (message) {
        if(!ws || (ws && ws.readyState === 3)){
          console.log('connection closed... attempting reconnect');
          this.connect(null,message,sessionID);
        }else{
          ws.send(message);
        }
      }
    };

    var activeSlide,
      activeOptions = [],
      wscount,
      pollcount,
      groupSlideIndex = 0,
      groupIndex = 0,
      totalVotes = 0,
      speakerList = [],
      currentSpeaker,
      activeOptionsString,
      propsList = [],
      rollingAverageEnabled = true,
      currentVotes = {agree:0, disagree:0},
      queueTitle,
      connectInfoMode = false,
      currentQuestionIndex = -1,
      previousQuestionIndex = -1,
      continuousFloorTime = document.querySelector('#continuousfloortime > span'),
      totalfloortime = document.querySelector('#totalfloortime > span'),
      contributions = document.querySelector('#contributions > span'),
      giveway = document.getElementById('giveway'),
      floorTime = null,
      totalFloorTimeLookup = {},
      totalFloorTimeList = [],
      timeTrackerInterval,
      speakerTracker = {},
      speakerTrackerList = [],
      TFTStart = '00:00:00',
      TFTEnd = '00:00:00',
      totalFloorTime,
        xcurrentSpeaker = {};

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
          var speaker = JSON.parse(e.attendee);
          try {
            if (speaker.name !== '') {
              onslyde.panel.queueSpeaker(speaker, e.ip);
            }
          } catch (err) {
            console.log('problem queueing speaker:',err);
          }
        }, false);

        window.addEventListener('disagree', function (e) {
          handleProps('disagree');
        }, false);

        window.addEventListener('agree', function (e) {
          handleProps('agree');
        }, false);

        window.addEventListener('questionToggle', function (e) {
          onslyde.panel.questionToggle();
        }, false);

        window.addEventListener('questionIndex', function (e) {
          previousQuestionIndex = currentQuestionIndex;
          console.log('cqi',currentQuestionIndex);
          currentQuestionIndex = (e.index || '-1');
          currentQuestionIndex = parseInt(currentQuestionIndex,10);
          onslyde.panel.questionIndex(currentQuestionIndex);
        }, false);
        //-----------end event listeners

        function handleProps(type) {
          var prop = document.getElementById(type);
          currentVotes[type]++;
          //add to scheduled list of votes/props for rolling average
          propsList.push({time:new Date(), type:type});
          //draw chart for this vote
          onslyde.panel.drawSentimentChart();
          if (prop) {
            prop.className = 'show-' + type + ' transition';
            setTimeout(function () {
              prop.className = 'hide-' + type + ' transition';
            }, 800);
          }
        }

        function manageRollingAverageVote(nowDate) {
          for (var i = 0; i < propsList.length; i++) {
            if ((nowDate - propsList[i].time) > 15000) {
              currentVotes[propsList[i].type]--;
              propsList.splice(i, 1);
              onslyde.panel.drawSentimentChart();
            }
          }
        }

        //start timer
        var timerHolder = document.getElementById('timer');

        var startsecond = 0;
        var eventDate = new Date();

        //main timer
        setInterval(function(){
          var now = new Date();
          if (rollingAverageEnabled) {
            manageRollingAverageVote(now);
          }
          timerHolder.innerHTML = onslyde.panel.countUpTimer(now - eventDate);
        },1000);


        //set the active options for opening discussion
        activeOptionsString = 'activeOptions:null,null,Discussion';

        this.connect('::connect::');
        setTimeout(function () {
          onslyde.panel.updateRemotes();
        }, 1000);

        document.getElementById('sessionID').innerHTML = this.calculateConnectString(sessionID);

        //hide the queued speaker title and show the connect info
        queueTitle = document.querySelector('.queue-title');
        queueTitle.style.display = 'none';

        this.drawSentimentChart();

      },

      //second param is optional
      countUpTimer:function(diff,countup){

        if(countup){
          diff += 1000;
        }

        var currentHours = Math.floor(diff / 3600000);
        var currentMinutes = Math.floor((diff % 3600000) / 60000);
        var currentSeconds = Math.floor(((diff % 3600000) % 60000) / 1000);
        currentHours = (currentHours < 10 ? "0" : "") + currentHours;
        currentMinutes = (currentMinutes < 10 ? "0" : "") + currentMinutes;
        currentSeconds = (currentSeconds < 10 ? "0" : "") + currentSeconds;
        return currentHours + ':' + currentMinutes + ":" + currentSeconds;
      },

      setFloorTime:function(){
        if(floorTime){
          clearInterval(floorTime);
        }
        var startTime = new Date();
        var counter = 0;
        floorTime = setInterval(function(){
          var now = new Date();
          continuousFloorTime.innerHTML = onslyde.panel.countUpTimer(now - startTime);
          counter++;
          if(counter > 60) {
            continuousFloorTime.style.color = '#FF99A0';
          }else{
            continuousFloorTime.style.color = '';
          }
          if(counter > 120){
            giveway.style.display = 'inline-block';
          }else{
            giveway.style.display = 'none';
          }

        },1000);
      },

      setTotalFloorTime:function(ip){

        var exists;

        if(totalFloorTime){
          clearInterval(totalFloorTime);
        }

        if(!xcurrentSpeaker[ip]){
          var start = Date.parse('Thu, 01 Jan 1970 00:00:00 GMT');
          xcurrentSpeaker[ip] = {start:start, contributions:0};
        }

        contributions.innerHTML = xcurrentSpeaker[ip].contributions++;


        totalFloorTime = setInterval(function(){
          var xtime = onslyde.panel.countUpTimer(xcurrentSpeaker[ip].start,true);
          totalfloortime.innerHTML = xtime;
          xcurrentSpeaker[ip].start = Date.parse('Thu, 01 Jan 1970 ' + xtime + ' GMT');
        },1000);

      },

      calculateConnectString:function (sessionID) {
        var lookup = ['x', 'b', 'z', 'd', 'y', 'f', 'r', 'h', 's', 'j'];
        var key = sessionID.toString().split('');
        var connectString = '';
        for (var i = 0; i < key.length; i++) {
          connectString += lookup[key[i]];
        }
        return connectString;
      },

      connect : function(initString) {
        //ws connect
//        console.log(ws,'connect',initString);
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

      questionToggle : function(){

//        console.log(currentQuestionIndex, previousQuestionIndex);
//        if(currentQuestionIndex === previousQuestionIndex){
//          if(questions.style.maxHeight === '0px'){
//            questions.style.maxHeight = '200px';
//            questions.style.opacity = 1;
//          }else{
//            questions.style.maxHeight = '0px';
//            questions.style.opacity = 0;
//          }
//        }else{
//          questions.style.maxHeight = '200px';
//          questions.style.opacity = 1;
//        }

      },

      questionIndex : function(){
        var questions = document.querySelectorAll('#question-container li'),
            isnew = false;
        for(var i = 0; i < questions.length; i++){
          console.log(currentQuestionIndex, previousQuestionIndex);
          if(currentQuestionIndex !== previousQuestionIndex){
            questions[i].style.maxHeight = (i === currentQuestionIndex ? '200px':'0px');
            questions[i].style.opacity = (i === currentQuestionIndex ? 1:0);
//            isnew = true;
//            break;
          }else{
            console.log(questions[i].style.maxHeight);
            if(questions[i].style.maxHeight !== '0px' && i === currentQuestionIndex){
              questions[i].style.maxHeight = ('0px');
              questions[i].style.opacity = (0);
            }else if(i === currentQuestionIndex){
              questions[i].style.maxHeight = ('200px');
              questions[i].style.opacity = (1);
            }

          }
        }
//        if(!isnew){
//          questioncontainer.style.maxHeight = '0px';
//          questioncontainer.style.opacity = 0;
//        }
      },

      toggleConnectInfo : function(){
        if(!connectInfoMode){
          document.getElementById("panel-container").className = "blur";
          document.getElementById("modal").className = "visible";
          document.getElementById("modal-connect-string").innerHTML = document.querySelector('.connect-url').innerHTML;
          connectInfoMode = true;
        }else{
          document.getElementById("panel-container").className = '';
          document.getElementById("modal").className = '';
          connectInfoMode = false;
        }
      },

      toggleRollingAverage:function () {
        rollingAverageEnabled = !rollingAverageEnabled;
        if(!rollingAverageEnabled){
          document.querySelector('.sentiment-bar1').style.borderRightColor = '#000';
          document.querySelector('.sentiment-bar2').style.borderLeftColor = '#000';
        }else{
          document.querySelector('.sentiment-bar1').style.borderRightColor = '#777';
          document.querySelector('.sentiment-bar2').style.borderLeftColor = '#777';
        }

      },

      updateDeck : function(wsc,pc) {
        var countHolder = document.getElementById('totalCount');
        wscount = wsc;
        pollcount = pc;
        countHolder.innerHTML = (parseInt(wsc, 10) + parseInt(pc, 10));
      },

      createSpeakerNode:function (speaker, ip, fn) {
        speaker.name = (speaker.name || speaker.FirstName + ' ' + speaker.Surname);

        var fragment = document.createDocumentFragment();
        fragment.appendChild(document.getElementById('speaker-template').cloneNode(true));
        var image = fragment.querySelector('img');
        image.src = speaker.pic;
        image.onclick = function () {
          fn(speaker, ip);
        };
        fragment.querySelector('.name').innerHTML = speaker.name;

        //do speaker lookup (if local JSON is provided)
        //todo - move this out to plugin
        try{
        var attendeesLookup = getAttendees();
        if(Object.prototype.toString.call(attendeesLookup) === '[object Array]' ){
          for (var i = 0, len = attendeesLookup.length; i < len; i++) {
            var attendee = attendeesLookup[i];
            var fullName = attendee.FirstName + ' ' + attendee.Surname;
            if(speaker.name === fullName){
              speaker.org = attendee.Company;
              break;
            }else if(speaker.email === attendee.Email){
              speaker.org = attendee.Company;
              break;
            }else{
              speaker.org = '';
            }
          }
        }
        }catch(e){
          console.log('fix this');
        }

        fragment.querySelector('.org').innerHTML = speaker.org;
        return fragment;
      },

      queueSpeaker:function (speaker, ip, internal) {
        var speakerIsQueued = false;

        //internal var handles the case of rebuilding the queue internally (i.e. through selecting a speaker for live)
        if(!internal){
          //this is for the cancel option on remotes. If they're already in the queue then that means they hit cancel.
          for (var i = 0, len = speakerList.length; i < len; i++) {
            if(speakerList[i].speaker.email === speaker.email){
              speakerIsQueued = true;
              break;
            }

          }
          if(!speakerIsQueued){
            //need to push onto array after we do the check for existing
            speakerList.push({'speaker':speaker, 'ip':ip});
          }
        }
        //if speaker is already queued remove them
        if (speakerIsQueued) {
          onslyde.panel.removeSpeakerFromList(speaker.email);
        } else {
          //passing in speaker data along with necessary onclick function for moderators
          document.getElementById('speakerQueue').appendChild(onslyde.panel.createSpeakerNode(speaker, ip, onslyde.panel.speakerLive));
        }

        //hide/show the header
        if(speakerList.length > 0){
          queueTitle.style.display = '';
          document.getElementById('queuedSpeakers').innerHTML = speakerList.length;
        }else if(speakerList.length === 0){
          queueTitle.style.display = 'none';
        }

      },

      upNextSpeaker:function (speaker, ip) {
        //passing in speaker data along with necessary onclick function for moderators
        document.getElementById('upNext').appendChild(onslyde.panel.createSpeakerNode(speaker, ip, onslyde.panel.speakerLive));
        //remove from list
        onslyde.panel.removeSpeakerFromList(speaker.email);
        //adjust UI
        document.getElementById('queuedSpeakers').innerHTML = speakerList.length;
      },

      speakerLive:function (speaker, ip) {
        //create full speaker name
        speaker.name = (speaker.name || speaker.FirstName + ' ' + speaker.Surname);

        var currentSpeakerNode = document.getElementById('currentSpeaker');
        currentSpeakerNode.innerHTML = '';

        onslyde.panel.setTotalFloorTime(ip);

        currentSpeakerNode.appendChild(onslyde.panel.createSpeakerNode(speaker, ip, onslyde.panel.removeSpeakerFromLive));
        //should we automatically move the next in the list to "up next" ?
        //for now just remove.
//        document.getElementById('upNext').innerHTML = '';
        //remove from list
        onslyde.panel.removeSpeakerFromList(speaker.email);
        //activate new poll for new speaker
        //server side
        activeOptionsString = 'activeOptions:null,null,' + speaker.name + "," + ip;

        //client side
        onslyde.panel.resetAllVotes();

        var twitterHandle = speaker.twitter,
          tweetButton = '<span class="tweet-button"><a href="https://twitter.com/' + twitterHandle + '" target="_blank"><i class="pictogram">&#62217;</i></a></span>';

        if(!twitterHandle){
          tweetButton = '';
        }
          onslyde.panel.connect(activeOptionsString);
          onslyde.panel.sendMarkup('' +
            '<span class="currently-speaking">Currently Speaking:</span><span class="speaker-name">' + speaker.name + '</span>' +
            tweetButton + '');


        //adjust UI
        document.getElementById('queuedSpeakers').innerHTML = speakerList.length;
      },

      removeSpeakerFromList:function (email) {
        var speakerWasQueued = false;
        //removes speaker from queue
        for (var i = 0; i < speakerList.length; i++) {
          if (speakerList[i].speaker.email === email) {
            speakerList.splice(i, 1);
            speakerWasQueued = true;
          }
        }

        //check for on the fly adding of speaker to "now speaking" from panel members
        if (speakerWasQueued) {
          //        console.log('speakerList after remove',speakerList);
          //todo - rebuild list - improve this
          document.getElementById('speakerQueue').innerHTML = '';
          //rebuild the list
          var currentListSize =  speakerList.length;
          for (var j = 0; j < currentListSize; j++) {
            onslyde.panel.queueSpeaker(speakerList[j].speaker, speakerList[j].ip, true);
          }
        }

      },

      clearQueue:function () {
        speakerList = [];
        queueTitle.style.display = 'none';
        document.getElementById('speakerQueue').innerHTML = '';
        onslyde.panel.resetAllVotes();
        activeOptionsString = 'activeOptions:null,null,Discussion';

        onslyde.panel.connect(activeOptionsString);
        document.getElementById('queuedSpeakers').innerHTML = speakerList.length;
      },

      removeSpeakerFromLive:function () {
        onslyde.panel.resetAllVotes();
        document.getElementById('currentSpeaker').innerHTML = 'Discussion';
        onslyde.panel.sendMarkup('<b>Panel Discussion</b>');
        activeOptionsString = 'activeOptions:null,null,Discussion';
        onslyde.panel.connect(activeOptionsString);
      },

      resetAllVotes:function () {
        currentVotes.agree = 0;
        currentVotes.disagree = 0;
        onslyde.panel.drawSentimentChart();
        propsList = [];
        onslyde.panel.setFloorTime();
      },

      resetContinuousFloorTime: function() {

      },

      drawSentimentChart:function () {
        var agreebar = document.getElementById('sentiment-chart-agree'),
          disagreebar = document.getElementById('sentiment-chart-disagree'),
          agreeCount = document.getElementById('agreeCount'),
          disagreeCount = document.getElementById('disagreeCount');
        if (currentVotes.agree === 0 && currentVotes.disagree === 0) {
          //reset chart
          agreebar.style.width = '10%';
          disagreebar.style.width = '10%';
        } else {
          var agreeVotes = (currentVotes.agree / (currentVotes.agree + currentVotes.disagree));
          var disagreeVotes = (currentVotes.disagree / (currentVotes.agree + currentVotes.disagree));
          agreebar.style.width = (agreeVotes * 100) + '%';
          disagreebar.style.width = (disagreeVotes * 100) + '%';
        }

        if(currentVotes.agree !== parseInt(agreeCount.innerHTML,10)){
          agreeCount.innerHTML = currentVotes.agree;
          agreeCount.className = 'bump-out';
          setTimeout(function(){agreeCount.className = 'bump-in';},200);
        }

        if(currentVotes.disagree !== parseInt(disagreeCount.innerHTML,10)){
          disagreeCount.innerHTML = currentVotes.disagree;
          disagreeCount.className = 'bump-out';
          setTimeout(function(){disagreeCount.className = 'bump-in';},200);
        }

      },

      wsCount : function() {
        return wscount;
      },

      pollCount : function() {
        return pollcount;
      },

      sendMarkup:function (markup) {
        // see if there's anything on the new slide to send to remotes EXPERIMENTAL

        //send to remotes
        var outerHtml = markup.replace(/'/g, "&#39;");
        var remoteMarkup = JSON.stringify({remoteMarkup:encodeURIComponent(outerHtml)});
        this.connect(remoteMarkup);

      },

      updateRemotes: function () {
        var activeOptionsString;

        if (activeOptions.length >= 1) {
          activeOptionsString = 'activeOptions:' + activeOptions + ',' + groupIndex + ':' + groupSlideIndex;
        } else {
          activeOptionsString = 'activeOptions:null,null,' + groupIndex + ':' + groupSlideIndex;
        }
//        console.log(activeOptionsString);
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
          if (currentVotes.hasOwnProperty(activeOptions[i])){
            totalVotes += currentVotes[activeOptions[i]];
          }
        }

//        barChart.vote(vote);
//        barChart.redraw();
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

    onslyde.template = onslyde.prototype = {

      // Simple JavaScript Templating
      // John Resig - http://ejohn.org/ - MIT Licensed
      simple:function (str, data) {
        /*jshint -W054 */
        var cache = {};

        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn = !/\W/.test(str) ?
          cache[str] = cache[str] ||
            onslyde.template.simple(document.getElementById(str).innerHTML) :

          // Generate a reusable function that will serve as a template
          // generator (and which will be cached).
          new Function("obj",
            "var p=[],print=function(){p.push.apply(p,arguments);};" +

              // Introduce the data as local variables using with(){}
              "with(obj){p.push('" +

              // Convert the template into pure JavaScript
              str
                .replace(/[\r\t\n]/g, " ")
                .split("<%").join("\t")
                .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                .replace(/\t=(.*?)%>/g, "',$1,'")
                .split("\t").join("');")
                .split("%>").join("p.push('")
                .split("\r").join("\\'") + "');}return p.join('');");

        // Provide some basic currying to the user
        return data ? fn(data) : fn;

      }
    };


    return onslyde;

  })();
})(window, document);


