/**
 * Common module
 */

const UTIL = require('./util')

/**
 * Position class
 *
 * @param {number} x
 * @param {number} y
 *
 * @returns {Object}
 */
const Position = function (x, y) {
  this.x = x
  this.y = y
}

/**
 * Vector class
 * extend Position class
 *
 * @param {number} x
 * @param {number} y
 * @param {number} [rotation=0]
 *
 * @returns {Object}
 */
const Vector = function (x, y, rotation) {
  if (typeof rotation === 'undefined') rotation = 0
  Position.call(this, x, y)

  this.rotation = rotation
}

Vector.prototype = Object.create(Position.prototype)
Vector.prototype.constructor = Vector

/**
 * Return Vector to JSON object
 *
 * @returns {Object}
 */
Vector.prototype.toJson = function () {
  const result = {
    x: this.x,
    y: this.y,
    rotation: this.rotation
  }

  return result
}

/**
 * Update Vector properties
 *
 * @param {number} x
 * @param {number} y
 * @param {number} rotation
 */
Vector.prototype.update = function (x, y, rotation) {
  this.x = x
  this.y = y
  this.rotation = rotation
}

/**
 * Update Vector properties by JSON object
 *
 * @param {Object}
 */
Vector.prototype.updateByJson = function (obj) {
  this.x = obj.x
  this.y = obj.y
  this.rotation = obj.rotation
}

/**
 * CreatureInfo
 *
 * @param {string} id
 * @param {string} type
 * @param {Vector} startVector
 * @param {number} life
 * @param {number} maxLife
 */
const CreatureInfo = function (id, type, startVector, velocitySpeed, life, maxLife) {
  /** @type {string} */
  this.id = id

  /** @type {string} creature type */
  this.type = type

  /** @type {number} initialize */
  this.initialLife = life

  /** @type {number} */
  this.maxLife = maxLife

  /** @type {number} immortal delay (milliseconds) */
  this.immortalDelay = 800

  /** @type {number} */
  this.velocitySpeed = velocitySpeed

  /* ---------------------------------------------------------------- Updatable on respawn
   */

  /** @type {Vector} start vector of creature */
  this.startVector = startVector

  /* ---------------------------------------------------------------- Updatable
   */

  /** @type {numberr} */
  this.life = life

  /** @type {Vector} last vector of creature */
  this.lastVector = startVector

  /** @type {string} last message */
  this.lastMessage = ''

  /** @type {number} last message timestamp */
  this.lastMessageTimestamp = 0

  /** @type {number} last damage timestamp */
  this.lastDamageTimestamp = 0

  /** @type {number} last recover timestamp */
  this.lastRecoverTimestamp = 0

  /** @type {Object} */
  this.autoMove = {}
}

/**
 * Creature
 * internal class
 *
 * @param {CreatureInfo} info
 * @param {Object} phrInfo
 * @param {Object} misc
 */
const Creature = function (info, phrInfo, misc) {
  this.info = info
  this.phrInfo = phrInfo
  this.misc = misc

  /** @type {Sprite} Phaser sprite object (label) */
  this.label = {}

  /** @type {Sprite} Phaser sprite object (shadow) */
  this.shadow = {}

  /** @type {Sprite} Phaser sprite object (weapon) */
  this.weapon = {}

  /** @type {Sprite} Phaser sprite object (bubble) */
  this.bubble = {}

  /** @type {Group} Phaser group object */
  this.bullet = {}
}

/**
 * Update last damage timestamp (by current UTC timestamp)
 */
Creature.prototype.updateLastDamageTimestamp = function () {
  this.info.lastDamageTimestamp = UTIL.getCurrentUtcTimestamp()
}

/**
 * Update last recover timestamp (by current UTC timestamp)
 */
Creature.prototype.updateLastRecoverTimestamp = function () {
  this.info.lastRecoverTimestamp = UTIL.getCurrentUtcTimestamp()
}

/**
 * Reset creature (misc)
 * used by client only
 */
Creature.prototype.reset = function () {
  this.misc.isImmortal = false

  // bubble
  this.misc.isTyping = false
  this.misc.lastEnterTimestamp = 0
}

/**
 * Update lastMessageTimestamp
 *
 * @param {number} [ts] - last message timestamp
 */
Creature.prototype.updateLastMessageTimestamp = function (ts) {
  if (typeof ts === 'undefined') ts = UTIL.getCurrentUtcTimestamp()
  this.info.lastMessageTimestamp = ts
}

/**
 * Update lastMessage
 *
 * @param {string} txt - message text
 */
Creature.prototype.updateLastMessage = function (txt) {
  this.info.lastMessage = txt
}

/**
 * Update lastEnterTimestamp
 *
 * @param {number} [ts] - last enter timestamp
 */
Creature.prototype.updateLastEnterTimestamp = function (ts) {
  if (typeof ts === 'undefined') ts = UTIL.getCurrentUtcTimestamp()
  this.misc.lastEnterTimestamp = ts
}

/**
 * Hero
 *
 * @param {CreatureInfo} creatureInfo
 */
const Hero = function (creatureInfo) {
  const info = creatureInfo
  const phrInfo = {
    spriteName: '',
    width: 0,
    height: 0,
    bodyOffset: 0,
    bodyMass: 100
  }
  const misc = {
    isImmortal: false,

    // bullet
    fireRate: 500, // 2 fire/sec
    nextFireTimestamp: 0,
    nBullets: 40,
    bulletSpeed: 500,

    // bubble
    isTyping: false,
    lastEnterTimestamp: 0
  }

  Creature.call(this, info, phrInfo, misc)
}
Hero.prototype = Object.create(Creature.prototype)
Hero.prototype.constructor = Hero

/**
 * Zombie
 *
 * @param {CreatureInfo} creatureInfo
 */
const Zombie = function (creatureInfo) {
  const info = creatureInfo
  const phrInfo = {
    spriteName: 'zombie',
    width: 46,
    height: 46,
    bodyOffset: 6,
    bodyMass: 0
  }
  const misc = {
    isImmortal: false,

    // bubble
    isTyping: false,
    lastEnterTimestamp: 0
  }

  Creature.call(this, info, phrInfo, misc)
}
Zombie.prototype = Object.create(Creature.prototype)
Zombie.prototype.constructor = Zombie

/**
 * Machine
 *
 * @param {CreatureInfo} creatureInfo
 */
const Machine = function (creatureInfo) {
  const info = creatureInfo
  const phrInfo = {
    spriteName: 'machine',
    width: 46,
    height: 46,
    bodyOffset: 6,
    bodyMass: 20
  }
  const misc = {
    isImmortal: false,

    // bullet
    fireRate: 1000, // 1 fire/sec
    nextFireTimestamp: 0,
    nBullets: 40,
    bulletSpeed: 500,

    // bubble
    isTyping: false,
    lastEnterTimestamp: 0
  }

  Creature.call(this, info, phrInfo, misc)
}
Machine.prototype = Object.create(Creature.prototype)
Machine.prototype.constructor = Machine

/**
 * Bat
 *
 * @param {CreatureInfo} creatureInfo
 */
const Bat = function (creatureInfo) {
  const info = creatureInfo
  const phrInfo = {
    spriteName: 'bat',
    width: 46,
    height: 46,
    bodyOffset: 8,
    bodyMass: 0
  }
  const misc = {
    isImmortal: false,

    // bubble
    isTyping: false,
    lastEnterTimestamp: 0
  }

  Creature.call(this, info, phrInfo, misc)
}
Bat.prototype = Object.create(Creature.prototype)
Bat.prototype.constructor = Bat

module.exports = {
  Position: Position,
  Vector: Vector,
  CreatureInfo: CreatureInfo,
  // Creature: Creature,
  Hero: Hero,
  Zombie: Zombie,
  Machine: Machine,
  Bat: Bat
}
