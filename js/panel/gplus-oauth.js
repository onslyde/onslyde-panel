(function (window, document) {
  "use strict";

var clientId = '849957059352.apps.googleusercontent.com',
    apiKey = 'AIzaSyAr0JthSfMJAIEjs-ufDrsq5cVpakFivSc',
    scopes = ['https://www.googleapis.com/auth/plus.me','https://www.googleapis.com/auth/userinfo.email'];

  var userObject = window.userObject = {name:'',email:'',org:'',pic:''};

onslyde.oauth = onslyde.prototype = {

  handleAuthClick : function (event) {
  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, onslyde.oauth.handleAuthResult);
  return false;
  },

  handleAuthResult : function (authResult) {
    var authorizeButton = document.getElementById('authorize-button');
    var speakButton = document.getElementById('speak');

    if (authResult && !authResult.error) {
      authorizeButton.style.visibility = 'hidden';
      speakButton.onclick = function(event) {

        _gaq.push(['_trackEvent', 'onslyde-speak', 'vote']);
        ws.send('speak:' + JSON.stringify(userObject));
        speak.disabled = true;
        speak.value = 'You are queued to speak';
      };
      onslyde.oauth.makeApiCall();
    } else {
      authorizeButton.style.visibility = '';
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
        userObject.name = resp.displayName;
        userObject.pic = resp.image.url;
        document.querySelector('#speak').value = 'I want to speak';
      });
    });
    gapi.client.load('oauth2', 'v2', function() {
      var request = gapi.client.oauth2.userinfo.get();
      request.execute(function(resp2){
        userObject.email = resp2.email;
      });
    });
  }
};
})(window,document);