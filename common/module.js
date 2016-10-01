/**
 * Common module
 */

var UTIL = require('./util'),
  COMMON_CONFIG = require('./config');

/**
 * Position class
 * 
 * @param {number} x
 * @param {number} y
 * 
 * @returns {Object}
 */
var Position = function(x, y) {
  this.x = x;
  this.y = y;
};

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
var Vector = function(x, y, rotation) {
  if (typeof rotation === 'undefined') rotation = 0;
  Position.call(this, x, y);

  this.rotation = rotation;
};

Vector.prototype = Object.create(Position.prototype);
Vector.prototype.constructor = Vector;

Vector.prototype.toJson = function() {
  var result = {
    x: this.x,
    y: this.y,
    rotation: this.rotation,
  };

  return result; 
};

Vector.prototype.update = function(x, y, rotation) {
  this.x = x;
  this.y = y;
  this.rotation = rotation;
};

Vector.prototype.updateByJson = function(obj) {
  this.x = obj.x;
  this.y = obj.y;
  this.rotation = obj.rotation;
};

/**
 * Message object
 * unused
 * 
 * @param {string} playerId
 * @param {string} text
 * @param {number} utcTimestamp
 */
var Message = function(playerId, text, utcTimestamp) {
  this.id = playerId;
  this.text = text
  this.utcTimestamp = utcTimestamp;
};

/**
 * CreatureInfo
 * 
 * @param {string} id
 * @param {string} type
 * @param {Vector} startVector
 * @param {number} life
 * @param {number} maxLife
 */
var CreatureInfo = function(id, type, startVector, life, maxLife) {
  /** @type {string} */
  this.id = id;

  /** @type {string} creature type */
  this.type = type;

  /** @type {number} initialize */
  this.initialLife = life;

  /** @type {number} */
  this.maxLife = maxLife;

  /** @type {number} immortal delay (milliseconds) */
  this.immortalDelay = 800;

  /*---------------------------------------------------------------- Updatable on respawn
   */

  /** @type {Vector} start vector of creature */
  this.startVector = startVector;

  /*---------------------------------------------------------------- Updatable
   */

  /** @type {numberr} */
  this.life = life;

  /** @type {Vector} last vector of creature */
  this.lastVector = startVector,

  /** @type {string} last message */
  this.lastMessage = '';

  /** @type {number} last message timestamp */
  this.lastMessageTimestamp = 0;

  /** @type {number} last damage timestamp */
  this.lastDamageTimestamp = 0;

  /** @type {number} last recover timestamp */
  this.lastRecoverTimestamp = 0;
};

/**
 * Creature
 * internal class
 * 
 * @param {Object} info
 * @param {Object} phrInfo
 * @param {Object} misc
 */
var Creature = function(info, phrInfo, misc) {
  this.info = info;
  this.phrInfo = phrInfo;
  this.misc = misc;
  
  /** @type {Sprite} Phaser sprite object (label) */
  this.label = {};

  /** @type {Sprite} Phaser sprite object (shadow) */
  this.shadow = {};

  /** @type {Sprite} Phaser sprite object (weapon) */
  this.weapon = {};

  /** @type {Sprite} Phaser sprite object (bubble) */
  this.bubble = {};

  /** @type {Group} Phaser group object */
  this.bullet = {};
};

Creature.prototype.updateLastDamageTimestamp = function() {
  this.info.lastDamageTimestamp = UTIL.getCurrentUtcTimestamp();
};

Creature.prototype.updateLastRecoverTimestamp = function() {
  this.info.lastRecoverTimestamp = UTIL.getCurrentUtcTimestamp();
};

/**
 * Reset creature (misc)
 * used by client only
 */
Creature.prototype.reset = function() {
  this.misc.isImmortal = false;
  
  // automove
  this.misc.isAutomove = false;
  this.misc.autoMoveTargetPos = {};
  this.misc.autoMoveTimestamp = 0;
  this.misc.isIdle = false;
  this.misc.lastIdleTimestamp = 0;

  // bubble
  this.misc.isTyping = false;
  this.misc.lastEnterTimestamp = 0;
};

/**
 * Update lastMessageTimestamp
 * 
 * @param {number} [ts] - last message timestamp
 */
Creature.prototype.updateLastMessageTimestamp = function(ts) {
  if (typeof ts === 'undefined') ts = UTIL.getCurrentUtcTimestamp(); 
  this.info.lastMessageTimestamp = ts;
};

/**
 * Update lastMessage
 * 
 * @param {string} txt - message text
 */
Creature.prototype.updateLastMessage = function(txt) {
  this.info.lastMessage = txt;
};

/**
 * Update lastEnterTimestamp
 * 
 * @param {number} [ts] - last enter timestamp 
 */
Creature.prototype.updateLastEnterTimestamp = function(ts) {
  if (typeof ts === 'undefined') ts = UTIL.getCurrentUtcTimestamp();
  this.misc.lastEnterTimestamp = ts;
};

/**
 * Update lastIdleTimestamp
 * 
 * @param {number} [ts] - last idle timestamp
 */
Creature.prototype.updateLastIdleTimestamp = function(ts) {
  if (typeof ts === 'undefined') ts = UTIL.getCurrentUtcTimestamp(); 
  this.misc.lastIdleTimestamp = ts;
};

/**
 * Hero
 * 
 * @param {CreatureInfo} creatureInfo
 */
var Hero = function(creatureInfo) {
  var info = creatureInfo,
    phrInfo = {
      spriteName: '',
      width: 0,
      height: 0,
      bodyOffset: 0,
      bodyMass: 100,
      velocitySpeed: 200,
    },
    misc = {
      isImmortal: false,
      visibleRange: 300,

      // bullet
      fireRate: 500, // 2 fire/sec 
      nextFireTimestamp: 0,
      nBullets: 40,
      bulletSpeed: 500,
      
      // automove
      isAutomove: false,
      autoMoveTargetPos: {},
      autoMoveTimestamp: 0,
      isIdle: false,
      lastIdleTimestamp: 0,

      // bubble
      isTyping: false,
      lastEnterTimestamp: 0,
    };
  
  Creature.call(this, info, phrInfo, misc);
};
Hero.prototype = Object.create(Creature.prototype);
Hero.prototype.constructor = Hero;

/**
 * Zombie
 * 
 * @param {CreatureInfo} creatureInfo
 */
var Zombie = function(creatureInfo) {
  var info = creatureInfo,
    phrInfo = {
      spriteName: 'zombie',
      width: 46,
      height: 46,
      bodyOffset: 6,
      bodyMass: 0,
      velocitySpeed: 100,
    },
    misc = {
      isImmortal: false,
      visibleRange: 200,

      // automove
      isAutomove: false,
      autoMoveTargetPos: {},
      autoMoveTimestamp: 0,
      isIdle: false,
      lastIdleTimestamp: 0,

      // bubble
      isTyping: false,
      lastEnterTimestamp: 0,
    };
  
  Creature.call(this, info, phrInfo, misc);
};
Zombie.prototype = Object.create(Creature.prototype);
Zombie.prototype.constructor = Zombie;

/**
 * Machine
 * 
 * @param {CreatureInfo} creatureInfo
 */
var Machine = function(creatureInfo) {
  var info = creatureInfo,
    phrInfo = {
      spriteName: 'machine',
      width: 46,
      height: 46,
      bodyOffset: 6,
      bodyMass: 20,
      velocitySpeed: 120,
    },
    misc = {
      isImmortal: false,
      visibleRange: 300,

      // bullet
      fireRate: 1000, // 1 fire/sec
      nextFireTimestamp: 0,
      nBullets: 40,
      bulletSpeed: 500,
      
      // automove
      isAutomove: false,
      autoMoveTargetPos: {},
      autoMoveTimestamp: 0,
      isIdle: false,
      lastIdleTimestamp: 0,

      // bubble
      isTyping: false,
      lastEnterTimestamp: 0,
    };
  
  Creature.call(this, info, phrInfo, misc);
};
Machine.prototype = Object.create(Creature.prototype);
Machine.prototype.constructor = Machine;

/**
 * Bat
 * 
 * @param {CreatureInfo} creatureInfo
 */
var Bat = function(creatureInfo) {
  var info = creatureInfo,
    phrInfo = {
      spriteName: 'bat',
      width: 46,
      height: 46,
      bodyOffset: 8,
      bodyMass: 0,
      velocitySpeed: 120,
    },
    misc = {
      isImmortal: false,
      visibleRange: 240,
      
      // automove
      isAutomove: false,
      autoMoveTargetPos: {},
      autoMoveTimestamp: 0,
      isIdle: false,
      lastIdleTimestamp: 0,

      // bubble
      isTyping: false,
      lastEnterTimestamp: 0,
    };
  
  Creature.call(this, info, phrInfo, misc);
};
Bat.prototype = Object.create(Creature.prototype);
Bat.prototype.constructor = Bat;

module.exports = {
  Position: Position,
  Vector: Vector,
  Message: Message,
  CreatureInfo: CreatureInfo,
  // Creature: Creature,
  Hero: Hero,
  Zombie: Zombie,
  Machine: Machine,
  Bat: Bat,
};
