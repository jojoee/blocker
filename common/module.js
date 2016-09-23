/**
 * Common module
 */

var UTIL = require('./util'),
  COMMON_CONFIG = require('./config');

/**
 * Game utilities
 */
var GameUtil = {

  /**
   * Get random hero position
   * 
   * @returns {Position}
   */
  getRandomHeroPosition: function() {
    var pos = this.getRandomCreaturePosition(
      COMMON_CONFIG.hero.width,
      COMMON_CONFIG.hero.height
    );

    return pos;
  },

  /**
   * Get random monster position
   * (unused)
   * 
   * @returns {Position}
   */
  getRandomMonsterPosition: function() {
    var pos = this.getRandomCreaturePosition(
      COMMON_CONFIG.monster.width,
      COMMON_CONFIG.monster.height
    );

    return pos;
  },

  /**
   * Get random creature position
   * - Hero
   * - Monster
   * 
   * @param {number} creatureWidth
   * @param {number} creatureHeight
   * @returns {Position}
   */
  getRandomCreaturePosition: function(creatureWidth, creatureHeight) {
    var minWidth = creatureWidth / 2,
      maxWidth = (COMMON_CONFIG.game.worldWidth - creatureWidth) / 2,
      minHeight = creatureHeight / 2,
      maxHeight = (COMMON_CONFIG.game.worldHeight - creatureHeight) / 2;

    var x = UTIL.getRandomInt(minWidth, maxWidth),
      y = UTIL.getRandomInt(minHeight, maxHeight),
      angle = UTIL.getRandomInt(0, 360),
      pos = new Position(x, y, angle);

    return pos;
  },
};

/**
 * Position class
 * 
 * @param {number} x
 * @param {number} y
 * @param {number} [angle=0]
 * 
 * @returns {Object}
 */
var Position = function(x, y, angle) {
  if (typeof angle === 'undefined') angle = 0;
  this.x = x;
  this.y = x;
  this.angle = angle;

  /**
   * Export Position object in json format
   * 
   * @return {Object}
   */
  function toJson() {
    return {
      x: this.x,
      y: this.y,
      angle: this.angle,
    }
  }

  function update(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  function updateByJson(pos) {
    this.x = pos.x;
    this.y = pos.y;
    this.angle = pos.angle;
  }

  return {
    toJson: toJson,
    update: update,
    updateByJson: updateByJson,
  };
};

/**
 * Creature object
 * (unused)
 */
var Creature = function(id) {
  this.id = id;
};

/**
 * Player object
 * (unused)
 * TODO: refactor
 * 
 * type
 * - player
 * - bot
 * 
 * @param {number} id - object id
 * @param {string} [type=player] - player type
 */
var Player = function(id, type) {
  if (typeof type === 'undefined') type = 'player';

  /** @type {string} */
  this.id = id;

  /** @type {string} */
  this.type = type;

  /** @type {Position} */
  this.pos = GameUtil.getRandomHeroPosition();

  /** @type {string} */
  this.message = '';

  /** @type {number} timestamp */
  this.latestTyping = UTIL.getCurrentUtcTimestamp();

  /** @type {number} timestamp */
  this.latestUpdate = UTIL.getCurrentUtcTimestamp(); // ignore typing

  /**
   * Get latest update timestamp
   * 
   * @returns {number}
   */
  this.getLatestUpdate = function() {
    return this.LatestUpdate;
  }

  /**
   * Update latest update timestamp
   */
  this.updateLatestUpdate = function() {
    this.latestUpdate = UTIL.getCurrentUtcTimestamp();
  }

  /**
   * Update latest typing timestamp
   */
  this.updateLatestTyping = function() {
    this.latestTyping = UTIL.getCurrentUtcTimestamp();
  }

  /**
   * Export Player object to json format
   * TODO: refactor
   * 
   * @returns {Object} Player object property in JSON format
   */
  this.toJson = function() {
    return {
      id: this.id,
      type: this.type,
      pos: this.pos.toJson(),
      message: this.message,
      latestTyping: this.updateLatestTyping,
      latestUpdate: this.updateLatestUpdate,
    };
  }
};

/**
 * Message object format
 * 
 * @param {string} playerId
 * @param {string} text
 * @param {number} utcTimestamp
 */
var Message = function(playerId, text, utcTimestamp) {

  return {
    id: playerId,
    text: text,
    utcTimestamp: utcTimestamp,
  }
};

/**
 * CreatureInfo
 * 
 * @param {number} life
 * @param {number} [maxLife]
 */
var CreatureInfo = function(life, maxLife) {
  if (typeof maxLife == 'undefined') maxLife = life;
  if (typeof id === 'undefined') id = UTIL.getRandomId();

  /** @type {string} */
  this.id = id;

  /** @type {numberr} */
  this.life = life;

  /** @type {number} */
  this.maxLife = maxLife;

  /** @type {number} last damage timestamp */
  this.lastDamageTimestamp = 0;

  /** @type {number} last recover timestamp */
  this.lastRecoverTimestamp = 0;

  /** @type {number} immortal delay (milliseconds) */
  this.immortalDelay = 800;

  function updateLastDamageTimestamp() {
    this.lastDamageTimestamp = UTIL.getCurrentUtcTimestamp();
  }

  function updateLastRecoverTimestamp() {
    this.lastRecoverTimestamp = UTIL.getCurrentUtcTimestamp();
  }

  return {
    id: this.id,
    life: this.life,
    maxLife: this.maxLife,
    lastDamageTimestamp: this.lastDamageTimestamp,
    lastRecoverTimestamp: this.lastRecoverTimestamp,
    immortalDelay: this.immortalDelay,
    updateLastDamageTimestamp: updateLastDamageTimestamp,
    updateLastRecoverTimestamp: updateLastRecoverTimestamp,
  };
};

/**
 * Creature
 * TODO: fix DI
 */
var Creature = function(info, phrInfo, misc) {
  this.info = info;
  this.phrInfo = phrInfo;
  this.misc = misc;

  this.lastPos = {};
  this.label = {};

  /** @type {Sprite} Phaser sprite object (shadow sprite) */
  this.shadow = {};

  /** @type {Sprite} Phaser sprite object */
  this.weapon = {};

  /** @type {Group} Phaser group object */
  this.bullet = {};
};

var Hero = function() {
  var info = new CreatureInfo(10),
    phrInfo = {
      speed: 200, // unsed
      angleSpeed: 200, // unused
    },
    misc = {
      visibleRange: 300, // unused
      fireRate: 500, // 2 fire/sec 
      nextFireTimestamp: 0,
      nBullets: 40,
      bulletSpeed: 500,
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
      bodyMass: -100,
    },
    misc = {
      visibleRange: 300,
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
      bodyMass: -100,
    },
    misc = {
      visibleRange: 300,
      fireRate: 1000, // 1 fire/sec
      nextFireTimestamp: 0,
      nBullets: 40,
      bulletSpeed: 500,
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
    },
    misc = {};
  
  Creature.call(this, info, phrInfo, misc);
};
Bat.prototype = Object.create(Creature.prototype);
Bat.prototype.constructor = Bat;

module.exports = {
  // GameUtil: GameUtil,
  // Position: Position,
  Message: Message,
  CreatureInfo: CreatureInfo,
  // Creature: Creature,
  // Player: Player,
  Hero: Hero,
  Zombie: Zombie,
  Machine: Machine,
  Bat: Bat,
};
