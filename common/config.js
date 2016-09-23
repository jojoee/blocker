/**
 * Server config
 * 
 * Event name
 * `player`: is something that interact by player (e.g. message)
 * `server`: other else is (e.g. newPlayer)
 */

var eventPlayerPrefix = 'player.',
  eventServerPrefix = 'server.';

var commonConfig = {
  // prod should be true
  isOnline: false,
  isProd: false,

  // dev should be true
  isDebug: true,

  // dummy
  isDummy: true,

  // others
  serverPort: 8001,
  game: {
    worldWidth: 2300,
    worldHeight: 2300,
  },
  hero: {
    width: 46,
    height: 46,
  },
  monster: {
    width: 46,
    height: 46,
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

module.exports = commonConfig;
