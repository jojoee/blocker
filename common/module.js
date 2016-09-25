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
 * internal class
 * 
 * @param {number} life
 * @param {number} [maxLife]
 */
var CreatureInfo = function(life, maxLife) {
  if (typeof maxLife == 'undefined') maxLife = life;

  /** @type {string} */
  this.id = '';

  /** @type {numberr} */
  this.life = 1;

  /** @type {number} initialize */
  this.initialLife = life;

  /** @type {number} */
  this.maxLife = maxLife;

  /** @type {number} last damage timestamp */
  this.lastDamageTimestamp = 0;

  /** @type {number} last recover timestamp */
  this.lastRecoverTimestamp = 0;

  /** @type {number} immortal delay (milliseconds) */
  this.immortalDelay = 800;

  // initialize
  this.init();
};

CreatureInfo.prototype.updateLastDamageTimestamp = function() {
  this.lastDamageTimestamp = UTIL.getCurrentUtcTimestamp();
};

CreatureInfo.prototype.updateLastRecoverTimestamp = function() {
  this.lastRecoverTimestamp = UTIL.getCurrentUtcTimestamp();
};

CreatureInfo.prototype.init = function() {
  this.id = UTIL.getRandomId();
  this.life = this.initialLife;
};

/**
 * Creature
 * internal class
 */
var Creature = function(info, phrInfo, misc) {
  this.info = info;
  this.phrInfo = phrInfo;
  this.misc = misc;

  this.lastPos = {};
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

Creature.prototype.updateLastEnterTimestamp = function(ts) {
  if (typeof ts === 'undefined') ts = UTIL.getCurrentUtcTimestamp();
  this.misc.lastEnterTimestamp = ts;
};

Creature.prototype.updateLastMessageTimestamp = function(ts) {
  if (typeof ts === 'undefined') ts = UTIL.getCurrentUtcTimestamp(); 
  this.misc.lastMessageTimestamp = ts;
};

var Hero = function() {
  var info = new CreatureInfo(10),
    phrInfo = {
      spriteName: '',
      width: 0,
      height: 0,
      bodyOffset: 0,
      bodyMass: 0,
      velocitySpeed: 200,
    },
    misc = {
      creatureType: 'hero',
      isImmortal: false,
      visibleRange: 300,

      // bullet
      fireRate: 500, // 2 fire/sec 
      nextFireTimestamp: 0,
      nBullets: 40,
      bulletSpeed: 500,
      
      // automove
      isAutomove: false,
      autoMoveTargetPos: null,
      autoMoveTimestamp: 0,

      // bubble
      isTyping: false,
      lastEnterTimestamp: 0,
      lastMessageTimestamp: 0,
    };
  
  Creature.call(this, info, phrInfo, misc);
};
Hero.prototype = Object.create(Creature.prototype);
Hero.prototype.constructor = Hero;

var Zombie = function() {
  var info = new CreatureInfo(5, 8),
    phrInfo = {
      spriteName: 'zombie',
      width: 46,
      height: 46,
      bodyOffset: 6,
      bodyMass: 0,
      velocitySpeed: 100,
    },
    misc = {
      creatureType: 'zombie',
      isImmortal: false,
      visibleRange: 200,

      // automove
      isAutomove: false,
      autoMoveTargetPos: null,
      autoMoveTimestamp: 0,

      // bubble
      isTyping: false,
      lastEnterTimestamp: 0,
      lastMessageTimestamp: 0,
    };
  
  Creature.call(this, info, phrInfo, misc);
};
Zombie.prototype = Object.create(Creature.prototype);
Zombie.prototype.constructor = Zombie;

var Machine = function() {
  var info = new CreatureInfo(5),
    phrInfo = {
      spriteName: 'machine',
      width: 46,
      height: 46,
      bodyOffset: 6,
      bodyMass: 20,
      velocitySpeed: 120,
    },
    misc = {
      creatureType: 'machine',
      isImmortal: false,
      visibleRange: 300,

      // bullet
      fireRate: 1000, // 1 fire/sec
      nextFireTimestamp: 0,
      nBullets: 40,
      bulletSpeed: 500,
      
      // automove
      isAutomove: false,
      autoMoveTargetPos: null,
      autoMoveTimestamp: 0,

      // bubble
      isTyping: false,
      lastEnterTimestamp: 0,
      lastMessageTimestamp: 0,
    };
  
  Creature.call(this, info, phrInfo, misc);
};
Machine.prototype = Object.create(Creature.prototype);
Machine.prototype.constructor = Machine;

var Bat = function() {
  var info = new CreatureInfo(3),
    phrInfo = {
      spriteName: 'bat',
      width: 46,
      height: 46,
      bodyOffset: 8,
      bodyMass: 0,
      velocitySpeed: 120,
    },
    misc = {
      creatureType: 'bat',
      isImmortal: false,
      visibleRange: 240,
      
      // automove
      isAutomove: false,
      autoMoveTargetPos: null,
      autoMoveTimestamp: 0,

      // bubble
      isTyping: false,
      lastEnterTimestamp: 0,
      lastMessageTimestamp: 0,
    };
  
  Creature.call(this, info, phrInfo, misc);
};
Bat.prototype = Object.create(Creature.prototype);
Bat.prototype.constructor = Bat;

module.exports = {
  Position: Position,
  Vector: Vector,
  Message: Message,
  // CreatureInfo: CreatureInfo,
  // Creature: Creature,
  Hero: Hero,
  Zombie: Zombie,
  Machine: Machine,
  Bat: Bat,
};
