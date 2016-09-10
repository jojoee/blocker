// http://stackoverflow.com/questions/3387427/remove-element-by-id
function removeElement(elem) {
  return elem.parentNode.removeChild(elem);
}

document.addEventListener('DOMContentLoaded', function() {
  var CONFIG = config,
    CLIENT_CONFIG = clientConfig;

  var SOCKET = io(CLIENT_CONFIG.socketUrl),
    EVENT_NAME = CONFIG.eventName,
    $form = document.getElementById('form'),
    $textInput = document.getElementById('text-input'),
    $messageList = document.getElementById('messages'),
    $report = document.getElementById('report'),
    $playerList = document.getElementById('players');

  // player object
  // latestTyping, latestUpdate properties
  // should not be updated by client
  var PLAYER = {},
    LATEST_TYPING = 0;

  // Game
  var GAME = {};
  var WIDTH = 800,
    HEIGHT = 600,
    MAIN_FONT_FAMILY = 'Arial',
    SCREEN_COLOR = '#eee',
    ASSET_PATH = '/public/assets',
    IS_DEBUG = false;

  // IS_DEBUG = true;

  /*================================================================ Screen - Message
  */

  function getInputText() {
    return $textInput.value;
  }

  function resetInputText() {
    $textInput.value = '';
  }

  function addTextToMessageList(text) {
    var $li = document.createElement('li'),
      t = document.createTextNode(text);
    
    $li.appendChild(t);
    $messageList.appendChild($li);
  }

  function addPlayerMessageToMessageList(player) {
    if (player.message) {
      var text = '[' + player.latestUpdate + '] '  +
        player.playerId + ': ' +
        player.message;

      addTextToMessageList(text);
    }
  }

  /*================================================================ Screen - Report (typing)
  */

  function removeTypingStatus(msg) {
    updateReport('');
  }

  function addTypingStatus() {
    updateReport('Someone typing...');
  }

  // http://stackoverflow.com/questions/121817/how-do-i-replace-text-inside-a-div-element
  function updateReport(msg) {
    $report.innerHTML = msg;
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

  /*================================================================ Screen - Player list
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

    $playerList.appendChild($li);
  }

  function removePlayerFromPlayerList(disconnectedPlayer) {
    var playerId = disconnectedPlayer.playerId,
      $li = document.querySelectorAll('[data-player-id="' + playerId + '"]')[0];

    removeElement($li);
  }

  /*================================================================ Screen - Interval
  */

  window.setInterval(function() {    
    checkingTypingStatus();
  }, 1000);

  /*================================================================ Socket - Sending
  */

  // message
  // http://stackoverflow.com/questions/7410063/how-can-i-listen-to-the-form-submit-event-in-javascript
  $form.addEventListener('submit', function(e) {
    e.preventDefault();

    var message = getInputText();

    if (message) {
      PLAYER.message = message;
      SOCKET.emit(EVENT_NAME.player.message, PLAYER);
      resetInputText();
    }

    return false;
  });

  // typing
  // http://stackoverflow.com/questions/574941/best-way-to-track-onchange-as-you-type-in-input-type-text/26202266#26202266
  $textInput.oninput = onTextInputChange;
  $textInput.onpropertychange = $textInput.oninput;
  function onTextInputChange() {
    SOCKET.emit(EVENT_NAME.player.typing, null);
  }

  /*================================================================ Socket - Handle - Connect
  */

  // info
  SOCKET.on(EVENT_NAME.server.playerInfo, function(player) {
    console.log(player);

    PLAYER = player;
    addPlayerToPlayerList(player, 'my');
  });

  // existing players
  SOCKET.on(EVENT_NAME.server.existingPlayers, function(existingPlayers) {
    addPlayersToPlayerList(existingPlayers);
  });

  /*================================================================ Socket - Handle
  */

  // new player
  SOCKET.on(EVENT_NAME.server.newPlayer, function(newPlayer) {
    addPlayerToPlayerList(newPlayer);
  });

  // disconnected player
  SOCKET.on(EVENT_NAME.server.disconnectedPlayer, function(disconnectedPlayer) {
    removePlayerFromPlayerList(disconnectedPlayer);
  });

  // message
  SOCKET.on(EVENT_NAME.player.message, function(player) {
    addPlayerMessageToMessageList(player);
  });

  // typing
  SOCKET.on(EVENT_NAME.player.typing, function(player) {
    LATEST_TYPING = player.latestTyping;
    addTypingStatus();
  });
});
