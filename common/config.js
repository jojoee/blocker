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
  // prod
  isOnline: false,
  isProd: false,

  // dev
  isDebug: true,
  isImmortal: false,
  isInvisible: false,

  // others
  serverPort: 8001,
  game: {
    worldWidth: 2300,
    worldHeight: 2300,
  },
  eventName: {
    player: {
      // player is ready to connect
      ready: eventPlayerPrefix + 'ready',

      // player send message
      message: eventPlayerPrefix + 'message',

      // player move
      move: eventPlayerPrefix + 'move',

      // player fire
      fire: eventPlayerPrefix + 'fire',

      // player is fired
      isFired: eventPlayerPrefix + 'isFired',

      // player is welled
      isWelled: eventPlayerPrefix + 'isWelled',

      // player is overlapped (by monster weapon)
      isOverlappedByMonster: eventPlayerPrefix + 'isOverlappedByMonster',

      // player is died
      isDied: eventPlayerPrefix + 'isDied',

      // player is respawn
      isRespawn: eventPlayerPrefix + 'isRespawn',

      // player is respawn itself
      isRespawnItSelf: eventPlayerPrefix + 'isRespawnItSelf',
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
