var
  next = document.getElementById('next'),
  clear = document.getElementById('clear'),
  wsf = null;

function sendText(text){
  wsf.sendText(text);
}

function toggleQuestion(index){
  sendText('questionToggle:');
  sendText('questionIndex:' + index);
}


function getParameterByName(name) {
  var match = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

