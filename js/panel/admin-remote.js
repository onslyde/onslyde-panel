var toggle = document.getElementById('toggle'),
  next = document.getElementById('next'),
  clear = document.getElementById('clear'),
  wsf = null;

function sendText(text){
  wsf.sendText(text);
}

toggle.onclick = function (event) {
  sendText('questionToggle:');
};

function getParameterByName(name) {
  var match = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

