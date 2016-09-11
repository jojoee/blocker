var LATEST_TYPING = 0;

var $FORM = document.getElementById('form'),
  $TEXT_INPUT = document.getElementById('text-input'),
  $LOG_LIST = document.getElementById('logs'),
  $REPORT = document.getElementById('report'),
  $PLAYER_LIST = document.getElementById('players');

/*================================================================ Log
*/

function addTextToLogList(text) {
  var $li = document.createElement('li'),
    t = document.createTextNode(text);
  
  $li.appendChild(t);
  $LOG_LIST.appendChild($li);
}

/*---------------------------------------------------------------- Log - Message
*/

function getInputText() {
  return $TEXT_INPUT.value;
}

function resetInputText() {
  $TEXT_INPUT.value = '';
}

function addPlayerMessagesToMessageList(players) {
  var i = 0,
    nPlayers = players.length;

  for (i = 0; i < nPlayers; i++) {
    addPlayerMessageToMessageList(players[i]);
  }
}

function addPlayerMessageToMessageList(player) {
  if (player.message) {
    var text = '[' + util.convertTimestampToLocaleString(player.latestUpdate) + '] '  +
      player.playerId + ': ' +
      player.message;

    addTextToLogList(text);
  }
}

/*================================================================ Report
*/

// http://stackoverflow.com/questions/121817/how-do-i-replace-text-inside-a-div-element
function updateReport(msg) {
  $REPORT.innerHTML = msg;
}

/*---------------------------------------------------------------- Report - typing
*/

function removeTypingStatus(msg) {
  updateReport('');
}

function addTypingStatus() {
  updateReport('Someone typing...');
}

function resetLatestTyping() {
  LATEST_TYPING = 0;
}

function checkingTypingStatus() {
  var now = util.getCurrentUtcTimestamp();

  if (LATEST_TYPING > 0 &&
    (now - LATEST_TYPING > 1000)
  ) {
    resetLatestTyping();
    removeTypingStatus();
  }
}

/*================================================================ Player list
*/

function addPlayersToPlayerList(players, customClass) {
  var i = 0,
    n = players.length;

  for (i = 0; i < n; i++) {
    addPlayerToPlayerList(players[i], customClass);
  }
}

function addPlayerToPlayerList(player, customClass) {
  var $li = document.createElement('li'),
    t = document.createTextNode(player.playerId);
  
  $li.appendChild(t);
  $li.setAttribute('data-player-id', player.playerId);
  if (customClass !== undefined) {
    $li.classList.add(customClass);
  }

  $PLAYER_LIST.appendChild($li);
}

function removePlayerFromPlayerList(disconnectedPlayer) {
  var playerId = disconnectedPlayer.playerId,
    $li = document.querySelectorAll('[data-player-id="' + playerId + '"]')[0];

  util.removeElement($li);
}

/*================================================================ Interval
*/

window.setInterval(function() {    
  checkingTypingStatus();
}, CLIENT_HEARTHBEAT);

/*================================================================ Socket - Send event
*/

// message
// http://stackoverflow.com/questions/7410063/how-can-i-listen-to-the-form-submit-event-in-javascript
$FORM.addEventListener('submit', function(e) {
  e.preventDefault();
  var message = getInputText();

  if (message) {
    PLAYER.info.message = message;
    SOCKET.emit(EVENT_NAME.player.message, PLAYER.info);
    resetInputText();
  }

  return false;
});

// typing
// http://stackoverflow.com/questions/574941/best-way-to-track-onchange-as-you-type-in-input-type-text/26202266#26202266
$TEXT_INPUT.oninput = onTextInputChange;
$TEXT_INPUT.onpropertychange = $TEXT_INPUT.oninput;
function onTextInputChange() {
  SOCKET.emit(EVENT_NAME.player.typing, null);
}
