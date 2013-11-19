var speak = document.querySelector('#speak'),
  disagree = document.querySelector('#disagree'),
  agree = document.querySelector('#agree'),
  voted,
  isSpeaking = false,
  wsf = null;



speak.onclick = function (event) {
  _gaq.push(['_trackEvent', 'onslyde-speak', 'vote']);
  if (window.userObject.name === '') {
    speak.onclick = onslyde.oauth.handleAuthClick;
  } else {
    wsf.sendText('speak:' + JSON.stringify(userObject));
    speak.value = 'Cancel';
  }
};

var agreeTimeout,
  disagreeTimeout,
  disagreeInterval,
  agreeInterval;

disagree.onclick = function (event) {
  _gaq.push(['_trackEvent', 'onslyde-disagree', 'vote']);
  wsf.sendText('props:disagree,' + window.userObject.name + "," + window.userObject.email);
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
  wsf.sendText('props:agree,' + window.userObject.name + "," + window.userObject.email);
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

