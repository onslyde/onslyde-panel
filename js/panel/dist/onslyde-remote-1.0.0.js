/*! onslyde - v0.0.1 - 2014-03-18
* Copyright (c) 2014 Wesley Hales; Licensed  */
var speak = document.getElementById('speak'),
  disagree = document.getElementById('disagree'),
  agree = document.getElementById('agree'),
  logo = document.getElementById('logo'),
  voted,
  isSpeaking = false,
  wsf = null,
  voteCount = 0,
  voteKey = {1:'slow',2:'fast',3:'faster',4:'fuckingfast'};

function sendText(text){
  voteCount++;
//  if(voteCount > 0 && voteCount < 5){
//    logo.setAttribute('class','logo-banner ' + voteKey[voteCount]);
//  }
  wsf.sendText(text);
}

speak.onclick = function (event) {
  _gaq.push(['_trackEvent', 'onslyde-speak', 'vote']);
  if (window.userObject.name === '') {
    speak.onclick = onslyde.oauth.handleAuthClick;
  } else {
    sendText('speak:' + JSON.stringify(userObject));
    speak.value = 'Cancel';
  }
};

var agreeTimeout,
  disagreeTimeout,
  disagreeInterval,
  agreeInterval;

disagree.onclick = function (event) {
  _gaq.push(['_trackEvent', 'onslyde-disagree', 'vote']);
  sendText('props:disagree,' + window.userObject.name + "," + window.userObject.email + ',' + new Date().getTime());
  disagree.disabled = true;
  disagree.style.opacity = 0.4;

  clearTimeout(disagreeTimeout);
  disagreeTimeout = setTimeout(function () {
    disagree.disabled = false;
    disagree.style.opacity = 1;
    disagree.value = 'Disagree';
    clearInterval(disagreeInterval);
  }, 15000);
  var counter = 15;
  disagreeInterval = setInterval(function () {
    disagree.value = 'vote again in ' + counter + ' seconds';
    counter--;
  }, 1000);
  return false;
};

agree.onclick = function (event) {
  _gaq.push(['_trackEvent', 'onslyde-agree', 'vote']);
  sendText('props:agree,' + window.userObject.name + "," + window.userObject.email + ',' + new Date().getTime());
  agree.disabled = true;
  agree.style.opacity = 0.4;
//  agree.value = "vote again in 15 seconds";
  clearTimeout(agreeTimeout);
  agreeTimeout = setTimeout(function () {
    agree.disabled = false;
    agree.style.opacity = 1;
    agree.value = 'Agree';
    clearInterval(agreeInterval);
  }, 15000);
  var counter = 15;
  agreeInterval = setInterval(function () {
    agree.value = 'vote again in ' + counter + ' seconds';
    counter--;
  }, 1000);
  return false;
};

function disablePoll() {
  disagree.disabled = true;
  disagree.disabled = true;
  agree.style.opacity = 0.4;
  agree.style.opacity = 0.4;

  speak.disabled = true;
  speak.style.opacity = 0.4;
//  voteLabel.innerHTML = 'Waiting...';
}

disablePoll();

function enablePoll() {

  if (!isSpeaking) {
    speak.disabled = false;
    speak.value = 'I want to speak';
    speak.style.opacity = 1;
  }
  clearTimeout(agreeTimeout);
  clearInterval(agreeInterval);
  agree.disabled = false;
  agree.style.opacity = 1;
  agree.value = 'Agree';
//  }

  clearTimeout(disagreeTimeout);
  clearInterval(disagreeInterval);
  disagree.disabled = false;
  disagree.value = 'Disagree';
  disagree.style.opacity = 1;
//  }


//  voteLabel.innerHTML = 'Vote!';
  voted = false;
}

window.addEventListener('updateOptions', function (e) {
  enablePoll();
}, false);



var resetTimeout;

function handleSpeakEvent(e) {
  if (e.position === '777') {
    isSpeaking = true;
    speak.value = 'You\'re speaking!';
    speak.disabled = true;
    speak.style.opacity = 0.4;
    resetTimeout = setTimeout(function () {
      isSpeaking = false;
      speak.style.opacity = 1;
      speak.value = 'I want to speak';
      speak.disabled = false;
      clearTimeout(resetTimeout);
    }, 20000);
  } else {

  }
}

//callback for pressing the speak button (managed server side)
window.addEventListener('speak', function (e) {
  handleSpeakEvent(e);
}, false);

window.addEventListener('remoteMarkup', function (e) {
//  console.log('e', typeof e.markup);

  if (e.markup !== '') {
    var markup = JSON.parse(e.markup);
    try {
      document.getElementById('from-slide').innerHTML = decodeURIComponent(markup.remoteMarkup);
    } catch (err) {
      console.log(err);
    }
  }

  //checking for type of object due to the way this response comes back from polling vs. ws clients
  //this code is also duped as a filler for polling clients ... todo unify
  if (typeof e.data !== 'object' && e.data !== '') {

    var data = JSON.parse(e.data);
    if (data !== '' && localStorage['onslyde.attendeeIP'] === data.attendeeIP) {
      handleSpeakEvent(data);
    } else {
      speak.value = 'I want to speak';
    }
  }

}, false);


window.addEventListener('roulette', function (e) {
  var rouletteDiv = document.getElementById('roulette'),
    timer1,
    timer2;
  rouletteDiv.style.display = 'block';
  if (!e.winner) {
    //simple state check for multiple raffles on the same session
    if (rouletteDiv.style.backgroundColor !== 'yellow') {
      rouletteDiv.innerHTML = "<p>calculating...</p>";
      timer1 = setTimeout(function () {
        rouletteDiv.innerHTML = "<p>sorry! maybe next time :)</p>";
      }, 5000);
    }

  } else if (e.winner) {
    setTimeout(function () {
      rouletteDiv.style.backgroundColor = 'yellow';
      rouletteDiv.innerHTML = "<p>WINNER!!...</p>";
    }, 5000);
  }
}, false);

function getParameterByName(name) {
  var match = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}


(function (window, document) {
  "use strict";

  var clientId = '849957059352.apps.googleusercontent.com',
    apiKey = 'AIzaSyAr0JthSfMJAIEjs-ufDrsq5cVpakFivSc',
    scopes = ['https://www.googleapis.com/auth/plus.me','https://www.googleapis.com/auth/userinfo.email'];

  window.userObject = {name:'',email:'',org:'',pic:''};

  onslyde.oauth = onslyde.prototype = {

    handleAuthClick : function (event) {
      gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, onslyde.oauth.handleAuthResult);
      return false;
    },

    handleAuthResult : function (authResult) {
      var authorizeButton = document.getElementById('authorize-button');
      var authHolder = document.getElementById('auth-holder');
      var speakButton = document.getElementById('speak');

      if (authResult && !authResult.error) {
        authHolder.style.display = 'none';
        speakButton.onclick = function(event) {
          _gaq.push(['_trackEvent', 'onslyde-speak', 'vote']);
          wsf.sendText('speak:' + JSON.stringify(window.userObject));
          if(speak.value === 'Cancel'){
            speak.value = 'I want to speak';
          }else{
            speak.value = 'Cancel';
          }
        };
        onslyde.oauth.makeApiCall();
      } else {
        authHolder.style.display = '';
        authorizeButton.onclick = onslyde.oauth.handleAuthClick;
      }
    },

    checkAuth : function () {
      gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, onslyde.oauth.handleAuthResult);
    },

    handleClientLoad : function () {
      gapi.client.setApiKey(apiKey);
      window.setTimeout(onslyde.oauth.checkAuth,1);
    },

    makeApiCall : function () {
      //  console.log(gapi.auth.getToken())
      gapi.client.load('plus', 'v1', function() {
        var request = gapi.client.plus.people.get({
          'userId': 'me'
        });
        request.execute(function(resp) {
          window.userObject.name = resp.displayName;
          window.userObject.pic = resp.image.url;
          document.querySelector('#speak').value = 'I want to speak';
        });
      });
      gapi.client.load('oauth2', 'v2', function() {
        var request = gapi.client.oauth2.userinfo.get();
        request.execute(function(resp2){
          window.userObject.email = resp2.email;
        });
      });
    }
  };
})(window,document);
(function (window, document) {
  "use strict";

  window.addEventListener('load', function (e) {
    // in fallback mode: connect returns a dummy object implementing the WebSocket interface
    wsf = onslyde.wsFallback.createSocket().gracefulWebSocket('wss://' + onslyde.ws.ip(onslyde.ws.sessionID()) + '/ws/'); // the ws-protocol will automatically be changed to http
  }, false);

  onslyde.wsFallback = onslyde.prototype = {

    createSocket : function() {

      function encodeData(data) {
        var urlEncodedData = "";

        for (var name in data) {
          urlEncodedData += name + "=" + data[name] + "&";
        }

        // We remove the last "&" character
        urlEncodedData = urlEncodedData.slice(0, -1);
        return urlEncodedData;
      }

      function buildFallbackURL(current_url)
      {
        var WS_URL = {
          protocol    :   "wss",
          ip_address  :   "107.22.176.73",
          port        :   "80"
        };

        // If websockets enabled, the fallback url will be the default onslyde URL.
        var ONSLYDE_URL = "https://www.onslyde.com";

        var ws_url = WS_URL.protocol + "://" + WS_URL.ip_address + "/ws/";
        return (current_url === ws_url) ? ONSLYDE_URL :
          current_url
            .replace("ws:","http:")     // If no websockets, replace current
            .replace("wss:","https:")   // websocket protocol with congruent
            .replace('/ws/','')
            .replace(WS_URL.port,""); // http protocol, and alter the port
      }

      return{
        gracefulWebSocket:function (url, options) {
          // Default properties
          this.defaults = {
            keepAlive:false, // not implemented - should ping server to keep socket open
            autoReconnect:false, // not implemented - should try to reconnect silently if socket is closed
            fallback:true, // not implemented - always use HTTP fallback if native browser support is missing
            fallbackSendURL:buildFallbackURL(url),
            fallbackSendMethod:'POST',
            fallbackPollURL:buildFallbackURL(url),
            fallbackPollMethod:'GET',
            fallbackOpenDelay:100, // number of ms to delay simulated open event
            fallbackPollInterval:3000, // number of ms between poll requests
            fallbackPollParams:{}    // optional params to pass with poll requests
          };

          // Override defaults with user properties
          var opts = this.defaults;

          /**
           * Creates a fallback object implementing the WebSocket interface
           */
          function FallbackSocket() {

            // WebSocket interface constants
            var CONNECTING = 0;
            var OPEN = 1;
            var CLOSING = 2;
            var CLOSED = 3;

            var pollInterval;
            var openTimout;
            var posturl = '';


            // create WebSocket object
            var fws = {
              // ready state
              readyState:CONNECTING,
              bufferedAmount:0,
              send:function (senddata) {

                var success = true;
                //replace colon from namespaced websocket data

                //todo - peak option for polling
                var vote = '',
                  attendeeIP = localStorage['onslyde.attendeeIP'];

                if (senddata.indexOf('speak:') === 0) {
                  vote = senddata.replace(('speak:'), '');
                  posturl = opts.fallbackSendURL + '/poll/attendees/speak';
                  senddata = {"speak":vote, "sessionID":onslyde.ws.sessionID(), "attendeeIP":attendeeIP};
                } else {
                  if (senddata.indexOf('vote:') === 0) {
                    vote = senddata.replace(('vote:'), '');
                  } else if (senddata.indexOf('props:') === 0) {
                    vote = senddata.replace(('props:'), '');
                  }

                  if (vote.split(',').length > 0) {
                    //we know/assume there will be 3 items in the array,
                    //with the vote data being the first

                    vote = vote.split(',')[0];
                  }

                  if (!window['userObject'] || typeof userObject === 'undefined') {
                    window.userObject = {
                      name:'unknown',
                      email:'unknown'
                    };
                  }

                  posturl = opts.fallbackSendURL + ':8443/go/attendees/vote';
                  senddata = {"vote":vote, "sessionID":onslyde.ws.sessionID(), "attendeeIP":attendeeIP, "username":window.userObject.name, "email":window.userObject.email, "voteTime": new Date().getTime()};
                }

                var ai = new onslyde.core.ajax(posturl, function (text, url) {
                  pollSuccess();
                }, false);
                ai.doPost(encodeData(senddata));

                return success;
              },
              close:function () {
                window.clearTimeout(openTimout);
                window.clearInterval(pollInterval);
                this.readyState = CLOSED;
              },
              onopen:function () {
              },
              onmessage:function (message) {
                //use the same message handler as core ws
                onslyde.ws._onmessage(message);
              },
              onerror:function () {
              },
              onclose:function () {
              },
              sendText:function(text){
                fws.send(text);
              },
              previousRequest:null,
              currentRequest:null
            };


            function getFallbackParams(tracked) {

              // update timestamp of previous and current poll request
              fws.previousRequest = fws.currentRequest;
              fws.currentRequest = new Date().getTime();

              return  {
                "previousRequest":fws.previousRequest,
                "currentRequest":fws.currentRequest,
                "sessionID":onslyde.ws.sessionID(),
                "attendeeIP":localStorage['onslyde.attendeeIP'],
                "tracked":tracked};
            }

            /**
             * @param {Object} data
             */
            function pollSuccess(data) {
              var messageEvent = {"data":data};
              fws.onmessage(messageEvent);
            }

            var counter = 0;

            function poll(tracked) {

              if (tracked !== 'start') {
                tracked = 'active';
              }

              var pollData = getFallbackParams(tracked);

              var ai = new onslyde.core.ajax(opts.fallbackPollURL + '/poll/attendees/json?' + encodeData(pollData), function (text, url) {
                pollSuccess(text);
              }, false);
              ai.doGet();

              counter++;
              if (counter === 3600) {
                window.clearInterval(pollInterval);
              }
            }

            // simulate open event and start polling
            openTimout = window.setTimeout(function () {
              fws.readyState = OPEN;
              poll('start');
              pollInterval = window.setInterval(poll, opts.fallbackPollInterval);
            }, opts.fallbackOpenDelay);

            // return socket impl
            return fws;
          }

          // create a new websocket or fallback
          var ws;

          if("WebSocket" in window && WebSocket.CLOSED > 2){
            ws = onslyde.ws.connect(null,'',onslyde.ws.sessionID());
          }else{
            ws = new FallbackSocket();
          }

          var senddata = {"sessionID":onslyde.ws.sessionID(), "attendeeIP":onslyde.ws.getip()};

          //create the ajax object for use when client disconnects
          var ai = new onslyde.core.ajax(opts.fallbackPollURL + '/poll/attendees/remove', function (text, url) {}, false);

          window.addEventListener("beforeunload", function (e) {
            ws.close();
            ws = null;
            var confirmationMessage = 'thanks!';
            //disconnect polling client on server
            if (!("WebSocket" in window)) {
              ai.doPost(encodeData(senddata));
            }
            (e || window.event).returnValue = confirmationMessage;  //Webkit, Safari, Chrome etc.
            return confirmationMessage;
          });

          return ws;
        }
      };
    }

  };
})(window,document);

/*jslint browser:true, node:true*/
/*global define, Event, Node*/


/**
 * Instantiate fast-clicking listeners on the specificed layer.
 *
 * @constructor
 * @param {Element} layer The layer to listen on
 */
function FastClick(layer) {
  'use strict';
  var oldOnClick, self = this;


  /**
   * Whether a click is currently being tracked.
   *
   * @type boolean
   */
  this.trackingClick = false;


  /**
   * Timestamp for when when click tracking started.
   *
   * @type number
   */
  this.trackingClickStart = 0;


  /**
   * The element being tracked for a click.
   *
   * @type EventTarget
   */
  this.targetElement = null;


  /**
   * X-coordinate of touch start event.
   *
   * @type number
   */
  this.touchStartX = 0;


  /**
   * Y-coordinate of touch start event.
   *
   * @type number
   */
  this.touchStartY = 0;


  /**
   * ID of the last touch, retrieved from Touch.identifier.
   *
   * @type number
   */
  this.lastTouchIdentifier = 0;


  /**
   * Touchmove boundary, beyond which a click will be cancelled.
   *
   * @type number
   */
  this.touchBoundary = 10;


  /**
   * The FastClick layer.
   *
   * @type Element
   */
  this.layer = layer;

  if (!layer || !layer.nodeType) {
    throw new TypeError('Layer must be a document node');
  }

  /** @type function() */
  this.onClick = function() { return FastClick.prototype.onClick.apply(self, arguments); };

  /** @type function() */
  this.onMouse = function() { return FastClick.prototype.onMouse.apply(self, arguments); };

  /** @type function() */
  this.onTouchStart = function() { return FastClick.prototype.onTouchStart.apply(self, arguments); };

  /** @type function() */
  this.onTouchMove = function() { return FastClick.prototype.onTouchMove.apply(self, arguments); };

  /** @type function() */
  this.onTouchEnd = function() { return FastClick.prototype.onTouchEnd.apply(self, arguments); };

  /** @type function() */
  this.onTouchCancel = function() { return FastClick.prototype.onTouchCancel.apply(self, arguments); };

  if (FastClick.notNeeded(layer)) {
    return;
  }

  // Set up event handlers as required
  if (this.deviceIsAndroid) {
    layer.addEventListener('mouseover', this.onMouse, true);
    layer.addEventListener('mousedown', this.onMouse, true);
    layer.addEventListener('mouseup', this.onMouse, true);
  }

  layer.addEventListener('click', this.onClick, true);
  layer.addEventListener('touchstart', this.onTouchStart, false);
  layer.addEventListener('touchmove', this.onTouchMove, false);
  layer.addEventListener('touchend', this.onTouchEnd, false);
  layer.addEventListener('touchcancel', this.onTouchCancel, false);

  // Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
  // which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
  // layer when they are cancelled.
  if (!Event.prototype.stopImmediatePropagation) {
    layer.removeEventListener = function(type, callback, capture) {
      var rmv = Node.prototype.removeEventListener;
      if (type === 'click') {
        rmv.call(layer, type, callback.hijacked || callback, capture);
      } else {
        rmv.call(layer, type, callback, capture);
      }
    };

    layer.addEventListener = function(type, callback, capture) {
      var adv = Node.prototype.addEventListener;
      if (type === 'click') {
        adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
          if (!event.propagationStopped) {
            callback(event);
          }
        }), capture);
      } else {
        adv.call(layer, type, callback, capture);
      }
    };
  }

  // If a handler is already declared in the element's onclick attribute, it will be fired before
  // FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
  // adding it as listener.
  if (typeof layer.onclick === 'function') {

    // Android browser on at least 3.2 requires a new reference to the function in layer.onclick
    // - the old one won't work if passed to addEventListener directly.
    oldOnClick = layer.onclick;
    layer.addEventListener('click', function(event) {
      oldOnClick(event);
    }, false);
    layer.onclick = null;
  }
}


/**
 * Android requires exceptions.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0;


/**
 * iOS requires exceptions.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);


/**
 * iOS 4 requires an exception for select elements.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOS4 = FastClick.prototype.deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


/**
 * iOS 6.0(+?) requires the target element to be manually derived
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOSWithBadTarget = FastClick.prototype.deviceIsIOS && (/OS ([6-9]|\d{2})_\d/).test(navigator.userAgent);


/**
 * Determine whether a given element requires a native click.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element needs a native click
 */
FastClick.prototype.needsClick = function(target) {
  'use strict';
  switch (target.nodeName.toLowerCase()) {

    // Don't send a synthetic click to disabled inputs (issue #62)
    case 'button':
    case 'select':
    case 'textarea':
      if (target.disabled) {
        return true;
      }

      break;
    case 'input':

      // File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
      if ((this.deviceIsIOS && target.type === 'file') || target.disabled) {
        return true;
      }

      break;
    case 'label':
    case 'video':
      return true;
  }

  return (/\bneedsclick\b/).test(target.className);
};


/**
 * Determine whether a given element requires a call to focus to simulate click into element.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
 */
FastClick.prototype.needsFocus = function(target) {
  'use strict';
  switch (target.nodeName.toLowerCase()) {
    case 'textarea':
    case 'select':
      return true;
    case 'input':
      switch (target.type) {
        case 'button':
        case 'checkbox':
        case 'file':
        case 'image':
        case 'radio':
        case 'submit':
          return false;
      }

      // No point in attempting to focus disabled inputs
      return !target.disabled && !target.readOnly;
    default:
      return (/\bneedsfocus\b/).test(target.className);
  }
};


/**
 * Send a click event to the specified element.
 *
 * @param {EventTarget|Element} targetElement
 * @param {Event} event
 */
FastClick.prototype.sendClick = function(targetElement, event) {
  'use strict';
  var clickEvent, touch;

  // On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
  if (document.activeElement && document.activeElement !== targetElement) {
    document.activeElement.blur();
  }

  touch = event.changedTouches[0];

  // Synthesise a click event, with an extra attribute so it can be tracked
  clickEvent = document.createEvent('MouseEvents');
  clickEvent.initMouseEvent('click', true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
  clickEvent.forwardedTouchEvent = true;
  targetElement.dispatchEvent(clickEvent);
};


/**
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.focus = function(targetElement) {
  'use strict';
  var length;

  if (this.deviceIsIOS && targetElement.setSelectionRange) {
    length = targetElement.value.length;
    targetElement.setSelectionRange(length, length);
  } else {
    targetElement.focus();
  }
};


/**
 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
 *
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.updateScrollParent = function(targetElement) {
  'use strict';
  var scrollParent, parentElement;

  scrollParent = targetElement.fastClickScrollParent;

  // Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
  // target element was moved to another parent.
  if (!scrollParent || !scrollParent.contains(targetElement)) {
    parentElement = targetElement;
    do {
      if (parentElement.scrollHeight > parentElement.offsetHeight) {
        scrollParent = parentElement;
        targetElement.fastClickScrollParent = parentElement;
        break;
      }

      parentElement = parentElement.parentElement;
    } while (parentElement);
  }

  // Always update the scroll top tracker if possible.
  if (scrollParent) {
    scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
  }
};


/**
 * @param {EventTarget} targetElement
 * @returns {Element|EventTarget}
 */
FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
  'use strict';

  // On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
  if (eventTarget.nodeType === Node.TEXT_NODE) {
    return eventTarget.parentNode;
  }

  return eventTarget;
};


/**
 * On touch start, record the position and scroll offset.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchStart = function(event) {
  'use strict';
  var targetElement, touch, selection;

  // Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
  if (event.targetTouches.length > 1) {
    return true;
  }

  targetElement = this.getTargetElementFromEventTarget(event.target);
  touch = event.targetTouches[0];

  if (this.deviceIsIOS) {

    // Only trusted events will deselect text on iOS (issue #49)
    selection = window.getSelection();
    if (selection.rangeCount && !selection.isCollapsed) {
      return true;
    }

    if (!this.deviceIsIOS4) {

      // Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
      // when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
      // with the same identifier as the touch event that previously triggered the click that triggered the alert.
      // Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
      // immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
      if (touch.identifier === this.lastTouchIdentifier) {
        event.preventDefault();
        return false;
      }

      this.lastTouchIdentifier = touch.identifier;

      // If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
      // 1) the user does a fling scroll on the scrollable layer
      // 2) the user stops the fling scroll with another tap
      // then the event.target of the last 'touchend' event will be the element that was under the user's finger
      // when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
      // is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
      this.updateScrollParent(targetElement);
    }
  }

  this.trackingClick = true;
  this.trackingClickStart = event.timeStamp;
  this.targetElement = targetElement;

  this.touchStartX = touch.pageX;
  this.touchStartY = touch.pageY;

  // Prevent phantom clicks on fast double-tap (issue #36)
  if ((event.timeStamp - this.lastClickTime) < 200) {
    event.preventDefault();
  }

  return true;
};


/**
 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.touchHasMoved = function(event) {
  'use strict';
  var touch = event.changedTouches[0], boundary = this.touchBoundary;

  if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
    return true;
  }

  return false;
};


/**
 * Update the last position.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchMove = function(event) {
  'use strict';
  if (!this.trackingClick) {
    return true;
  }

  // If the touch has moved, cancel the click tracking
  if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
    this.trackingClick = false;
    this.targetElement = null;
  }

  return true;
};


/**
 * Attempt to find the labelled control for the given label element.
 *
 * @param {EventTarget|HTMLLabelElement} labelElement
 * @returns {Element|null}
 */
FastClick.prototype.findControl = function(labelElement) {
  'use strict';

  // Fast path for newer browsers supporting the HTML5 control attribute
  if (labelElement.control !== undefined) {
    return labelElement.control;
  }

  // All browsers under test that support touch events also support the HTML5 htmlFor attribute
  if (labelElement.htmlFor) {
    return document.getElementById(labelElement.htmlFor);
  }

  // If no for attribute exists, attempt to retrieve the first labellable descendant element
  // the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
  return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
};


/**
 * On touch end, determine whether to send a click event at once.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchEnd = function(event) {
  'use strict';
  var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

  if (!this.trackingClick) {
    return true;
  }

  // Prevent phantom clicks on fast double-tap (issue #36)
  if ((event.timeStamp - this.lastClickTime) < 200) {
    this.cancelNextClick = true;
    return true;
  }

  this.lastClickTime = event.timeStamp;

  trackingClickStart = this.trackingClickStart;
  this.trackingClick = false;
  this.trackingClickStart = 0;

  // On some iOS devices, the targetElement supplied with the event is invalid if the layer
  // is performing a transition or scroll, and has to be re-detected manually. Note that
  // for this to function correctly, it must be called *after* the event target is checked!
  // See issue #57; also filed as rdar://13048589 .
  if (this.deviceIsIOSWithBadTarget) {
    touch = event.changedTouches[0];

    // In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
    targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
    targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
  }

  targetTagName = targetElement.tagName.toLowerCase();
  if (targetTagName === 'label') {
    forElement = this.findControl(targetElement);
    if (forElement) {
      this.focus(targetElement);
      if (this.deviceIsAndroid) {
        return false;
      }

      targetElement = forElement;
    }
  } else if (this.needsFocus(targetElement)) {

    // Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
    // Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
    if ((event.timeStamp - trackingClickStart) > 100 || (this.deviceIsIOS && window.top !== window && targetTagName === 'input')) {
      this.targetElement = null;
      return false;
    }

    this.focus(targetElement);

    // Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
    if (!this.deviceIsIOS4 || targetTagName !== 'select') {
      this.targetElement = null;
      event.preventDefault();
    }

    return false;
  }

  if (this.deviceIsIOS && !this.deviceIsIOS4) {

    // Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
    // and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
    scrollParent = targetElement.fastClickScrollParent;
    if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
      return true;
    }
  }

  // Prevent the actual click from going though - unless the target node is marked as requiring
  // real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
  if (!this.needsClick(targetElement)) {
    event.preventDefault();
    this.sendClick(targetElement, event);
  }

  return false;
};


/**
 * On touch cancel, stop tracking the click.
 *
 * @returns {void}
 */
FastClick.prototype.onTouchCancel = function() {
  'use strict';
  this.trackingClick = false;
  this.targetElement = null;
};


/**
 * Determine mouse events which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onMouse = function(event) {
  'use strict';

  // If a target element was never set (because a touch event was never fired) allow the event
  if (!this.targetElement) {
    return true;
  }

  if (event.forwardedTouchEvent) {
    return true;
  }

  // Programmatically generated events targeting a specific element should be permitted
  if (!event.cancelable) {
    return true;
  }

  // Derive and check the target element to see whether the mouse event needs to be permitted;
  // unless explicitly enabled, prevent non-touch click events from triggering actions,
  // to prevent ghost/doubleclicks.
  if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

    // Prevent any user-added listeners declared on FastClick element from being fired.
    if (event.stopImmediatePropagation) {
      event.stopImmediatePropagation();
    } else {

      // Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
      event.propagationStopped = true;
    }

    // Cancel the event
    event.stopPropagation();
    event.preventDefault();

    return false;
  }

  // If the mouse event is permitted, return true for the action to go through.
  return true;
};


/**
 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
 * an actual click which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onClick = function(event) {
  'use strict';
  var permitted;

  // It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
  if (this.trackingClick) {
    this.targetElement = null;
    this.trackingClick = false;
    return true;
  }

  // Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
  if (event.target.type === 'submit' && event.detail === 0) {
    return true;
  }

  permitted = this.onMouse(event);

  // Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
  if (!permitted) {
    this.targetElement = null;
  }

  // If clicks are permitted, return true for the action to go through.
  return permitted;
};


/**
 * Remove all FastClick's event listeners.
 *
 * @returns {void}
 */
FastClick.prototype.destroy = function() {
  'use strict';
  var layer = this.layer;

  if (this.deviceIsAndroid) {
    layer.removeEventListener('mouseover', this.onMouse, true);
    layer.removeEventListener('mousedown', this.onMouse, true);
    layer.removeEventListener('mouseup', this.onMouse, true);
  }

  layer.removeEventListener('click', this.onClick, true);
  layer.removeEventListener('touchstart', this.onTouchStart, false);
  layer.removeEventListener('touchmove', this.onTouchMove, false);
  layer.removeEventListener('touchend', this.onTouchEnd, false);
  layer.removeEventListener('touchcancel', this.onTouchCancel, false);
};


/**
 * Check whether FastClick is needed.
 *
 * @param {Element} layer The layer to listen on
 */
FastClick.notNeeded = function(layer) {
  'use strict';
  var metaViewport;

  // Devices that don't support touch don't need FastClick
  if (typeof window.ontouchstart === 'undefined') {
    return true;
  }

  if ((/Chrome\/[0-9]+/).test(navigator.userAgent)) {

    // Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
    if (FastClick.prototype.deviceIsAndroid) {
      metaViewport = document.querySelector('meta[name=viewport]');
      if (metaViewport && metaViewport.content.indexOf('user-scalable=no') !== -1) {
        return true;
      }

      // Chrome desktop doesn't need FastClick (issue #15)
    } else {
      return true;
    }
  }

  // IE10 with -ms-touch-action: none, which disables double-tap-to-zoom (issue #97)
  if (layer.style.msTouchAction === 'none') {
    return true;
  }

  return false;
};


/**
 * Factory method for creating a FastClick object
 *
 * @param {Element} layer The layer to listen on
 */
FastClick.attach = function(layer) {
  'use strict';
  return new FastClick(layer);
};


if (typeof define !== 'undefined' && define.amd) {

  // AMD. Register as an anonymous module.
  define(function() {
    'use strict';
    return FastClick;
  });
} else if (typeof module !== 'undefined' && module.exports) {
  module.exports = FastClick.attach;
  module.exports.FastClick = FastClick;
} else {
  window.FastClick = FastClick;
}