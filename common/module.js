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

  /** @type {string} */
  this.id = '';

  /** @type {numberr} */
  this.life = life;

  /** @type {number} */
  this.maxLife = maxLife;

  /** @type {number} last damage timestamp */
  this.lastDamageTimestamp = 0;

  /** @type {number} last recover timestamp */
  this.lastRecoverTimstamp = 0;

  /** @type {number} immortal delay (milliseconds) */
  this.immortalDelay = 300;

  /**
   * Initialize creature
   * 
   * @param {string} [id]
   */
  function init(id) {
    if (typeof id === 'undefined') id = UTIL.getRandomId();

    this.id = id;
  }

  function updateLastFireTimestamp() {
    this.lastFireTimestamp = UTIL.getCurrentUtcTimestamp();
  }

  function updateLastHealTimestamp() {
    this.lastHealTimestamp = UTIL.getCurrentUtcTimestamp();
  }

  return {
    id: this.id,
    life: this.life,
    maxLife: this.maxLife,
    lastFireTimestamp: this.lastFireTimestamp,
    lastHealTimestamp: this.lastHealTimestamp,
    immortalDelay: this.immortalDelay,
    init: init,
    updateLastFireTimestamp: updateLastFireTimestamp,
    updateLastHealTimestamp: updateLastHealTimestamp,
  };
};

/**
 * Monster object
 * (unused)
 * 
 * @param {string} id
 */
var Monster = function(id) {

};

/**
 * Zombie object
 * (unused)
 * 
 * @param {string} id
 */
var Zombie = function(id) {

};

/**
 * Machine object
 * (unused)
 * 
 * @param {string} id
 */
var Machine = function(id) {

};

/**
 * Bat object
 * (unused)
 * 
 * @param {string} id
 */
var Bat = function(id) {

};

module.exports = {
  // GameUtil: GameUtil,
  // Position: Position,
  Message: Message,
  CreatureInfo: CreatureInfo,
  // Creature: Creature,
  // Player: Player,
  // Monster: Monster,
  // Zombie: Zombie,
  // Machine: Machine,
  // Bat: Bat,
};
