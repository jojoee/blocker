/**
 * Server config
 *
 * Event name
 * `player`: is something that interact by player (e.g. message)
 * `server`: other else is (e.g. newPlayer)
 */

const eventPlayerPrefix = 'player.'
const eventServerPrefix = 'server.'

const commonConfig = {
  // prod
  isProd: true,

  // dev
  isDebug: false,

  // others
  serverPort: 8001,
  game: {
    worldWidth: 2300,
    worldHeight: 2300
  },
  eventName: {
    player: {
      // player is ready to connect
      ready: eventPlayerPrefix + 'ready',

      // player send message
      message: eventPlayerPrefix + 'message',

      // player move
      move: eventPlayerPrefix + 'move',

      // player rotate
      rotate: eventPlayerPrefix + 'rotate',

      // player fire
      fire: eventPlayerPrefix + 'fire',

      // player is damaged
      isDamaged: eventPlayerPrefix + 'isDamaged',
      isDamagedItSelf: eventPlayerPrefix + 'isDamagedItSelf',

      // player is recovered
      isRecovered: eventPlayerPrefix + 'isRecovered',
      isRecoveredItSelf: eventPlayerPrefix + 'isRecoveredItSelf',

      // player is died
      isDied: eventPlayerPrefix + 'isDied',
      isDiedItSelf: eventPlayerPrefix + 'isDiedItSelf',

      // player is respawn
      isRespawn: eventPlayerPrefix + 'isRespawn',
      isRespawnItSelf: eventPlayerPrefix + 'isRespawnItSelf',

      // player attack monster
      attackZombie: eventPlayerPrefix + 'attackZombie',
      attackMachine: eventPlayerPrefix + 'attackMachine',
      attackBat: eventPlayerPrefix + 'attackBat',

      // player kill monster
      killZombie: eventPlayerPrefix + 'killZombie',
      killMachine: eventPlayerPrefix + 'killMachine',
      killBat: eventPlayerPrefix + 'killBat',

      // respawn monster
      respawnZombie: eventPlayerPrefix + 'respawnZombie',
      respawnMachine: eventPlayerPrefix + 'respawnMachine',
      respawnBat: eventPlayerPrefix + 'respawnBat',

      // player attack enemy
      attackEnemy: eventPlayerPrefix + 'attackEnemy',

      // player kill enemy
      killEnemy: eventPlayerPrefix + 'killEnemy',

      // respawn enemy
      respawnEnemy: eventPlayerPrefix + 'respawnEnemy'
    },
    server: {
      // send new player
      newPlayer: eventServerPrefix + 'new player',

      // send disconnected player
      disconnectedPlayer: eventServerPrefix + 'disconnected player',

      // machine fire
      machineFire: eventPlayerPrefix + 'machineFire',

      // monster move
      zombieMove: eventPlayerPrefix + 'zombieMove',
      batMove: eventPlayerPrefix + 'batMove'
    }
  }
}

module.exports = commonConfig
