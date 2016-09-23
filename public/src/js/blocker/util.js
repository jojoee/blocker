// unused
var Util = {
  // isGameReady: false, // unused

  /*---------------------------------------------------------------- Socket
   */

  setSocketHandlers: function() {
    SOCKET.on(EVENT_NAME.server.newPlayer, onPlayerConnect);
    SOCKET.on(EVENT_NAME.server.disconnectedPlayer, onPlayerDisconnect);
    SOCKET.on(EVENT_NAME.player.message, onPlayerMessage);
    SOCKET.on(EVENT_NAME.player.move, onPlayerMove);
  },

  onPlayerConnect: function(data) {
    UTIL.clientLog('New player is connected', data);

    // screen
    // add player id to player list widget

    // game
    // add new enemy
  },

  onPlayerDisconnect: function(data) {
    UTIL.clientLog('Player is disconnected', data);

    // screen
    // remove player id from player list widget

    // game
    // remove enemt from game
  },

  onPlayerMessage: function(data) {
    util.clientLog('Receive the player\'s message', data);

    // screen
    // add player message to log

    // game
    // bouble message to the game
  },

  onPlayerMove: function(data) {
    // util.clientLog('Enemy is move');

    // game
    // move the enemy
  },

  init: function() {
    SOCKET.on('connect', function() {
      UTIL.clientLog('Connected to server');
    });

    SOCKET.on('disconnect', function() {
      UTIL.clientLog('Disconnected from ' + SOCKET_URL);
    });

    // player is ready
    SOCKET.on(EVENT_NAME.player.ready, function(data) {
      // set up game

      // set socket handlers

      // set IS_GAME_READY
    });
  },
};

module.exports = Util;
