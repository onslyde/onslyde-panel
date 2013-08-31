var speak = document.querySelector('#speak');
var disagree = document.querySelector('#disagree');
var agree = document.querySelector('#agree');
var voteLabel = document.querySelector('#vote-label');
var voted;
//todo make this unique user for session management/voter registration
//var ws = slidfast.ws.join('client:anonymous2');

disablePoll();

speak.onclick = function (event) {
  _gaq.push(['_trackEvent', 'onslyde-speak', 'vote']);
  if (userObject.name === '') {
    speak.onclick = handleAuthClick;
  } else {
    ws.send('speak:' + JSON.stringify(userObject));
    speak.disabled = true;
    speak.value = 'You are queued to speak';
  }


};

var agreeTimeout,
  disagreeTimeout;

disagree.onclick = function (event) {
  _gaq.push(['_trackEvent', 'onslyde-disagree', 'vote']);
  ws.send('props:disagree,' + userObject.name + "," + userObject.email);
  disagree.disabled = true;
  disagree.style.opacity = .4;
  disagree.value = "vote again in 30 seconds";
  clearTimeout(disagreeTimeout);
  disagreeTimeout = setTimeout(function () {
    disagree.disabled = false;
    disagree.style.opacity = 1;
    disagree.value = 'Disagree';
  }, 30000);
  return false;
};

agree.onclick = function (event) {
  _gaq.push(['_trackEvent', 'onslyde-agree', 'vote']);
  ws.send('props:agree,' + userObject.name + "," + userObject.email);
  agree.disabled = true;
  agree.style.opacity = .4;
  agree.value = "vote again in 30 seconds";
  clearTimeout(agreeTimeout);
  agreeTimeout = setTimeout(function () {
    agree.disabled = false;
    agree.style.opacity = 1;
    agree.value = 'Agree';
  }, 30000);
  return false;
};

function disablePoll() {
  disagree.disabled = true;
  disagree.disabled = true;
  agree.style.opacity = .4;
  agree.style.opacity = .4;

  speak.disabled = true;
  speak.style.opacity = .4;
  voteLabel.innerHTML = 'Waiting...';
}

function enablePoll() {
  speak.disabled = false;
  disagree.disabled = false;
  agree.disabled = false;
  disagree.value = 'Disagree';
  agree.value = 'Agree';
  speak.style.opacity = 1;
  disagree.style.opacity = 1;
  agree.style.opacity = 1;
  voteLabel.innerHTML = 'Vote!';
  voted = false;
}

window.addEventListener('updateOptions', function (e) {
  console.log('---updateOptions')
  enablePoll();
}, false);

//callback for pressing the speak button (managed server side)
window.addEventListener('speak', function (e) {
  handleSpeakEvent(e);
}, false);

var resetTimeout;

function handleSpeakEvent(e) {

  console.log('resetTimeout', resetTimeout, e)
  if (e.position === '777' && (typeof resetTimeout === 'undefined')) {
    speak.value = 'Thanks for speaking!';
    resetTimeout = setTimeout(function () {
      speak.value = 'I want to speak';
      speak.disabled = false;
    }, 20000);
  } else {

  }
}

window.addEventListener('remoteMarkup', function (e) {
//  console.log('e', typeof e.markup);

  if (e.markup !== '') {
    var markup = JSON.parse(e.markup);
    try {
      document.getElementById('from-slide').innerHTML = decodeURIComponent(markup.remoteMarkup);
    } catch (e) {
    }
  }

  //checking for type of object due to the way this response comes back from polling vs. ws clients
  //this code is also duped as a filler for polling clients ... todo unify
  if (typeof e.data !== 'object' && e.data !== '') {

    var data = JSON.parse(e.data);
    console.log('data.position', data.position, localStorage['onslyde.attendeeIP'], localStorage['onslyde.attendeeIP'] === data.attendeeIP);
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
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}