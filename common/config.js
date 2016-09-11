// player = client
// 
// `player` is something that interact by player (e.g. message)
// other else is `server` (e.g. existingPlayers, newPlayer)

var eventPlayerPrefix = 'player.',
  eventServerPrefix = 'server.';

var config = {
  serverPort: 3000,
  game: {
    worldWidth: 2000,
    worldHeight: 2000,
  },
  eventName: {
    player: {
      // player is ready to connect
      ready: eventPlayerPrefix + 'ready',

      // player send message
      message: eventPlayerPrefix + 'message',

      // player typing
      typing: eventPlayerPrefix + 'typing',

      // player move
      move: eventPlayerPrefix + 'move',
    },
    server: {
      // send new player
      newPlayer: eventServerPrefix + 'new player',

      // send disconnected player
      disconnectedPlayer: eventServerPrefix + 'disconnected player',
    }
  }
};

if (typeof module !== 'undefined' && module.exports != null) {
  module.exports = {
    serverPort: config.serverPort,
    game: config.game,
    eventName: config.eventName
  };
}
