var util = require('./../common/util'),
  commonConfig = require('./../common/config');

// Player
// 
// playerType:
// - player
// - bot
var Player = function(playerId, playerType) {
  if (playerType === undefined) playerType = 'player';

  // unchange
  this.playerId = playerId;
  this.playerType = playerType;

  this.message = '';
  this.x = util.getRandomInt(0, commonConfig.game.worldWidth);
  this.y = util.getRandomInt(0, commonConfig.game.worldHeight);
  this.angle = util.getRandomInt(0, 360);
  this.latestTyping = util.getCurrentUtcTimestamp();
  this.latestUpdate = util.getCurrentUtcTimestamp(); // ignore typing

  function getPlayerId() {
    return this.playerId;
  }

  function getPlayerType() {
    return this.playerType;
  }

  function getX() {
    return this.x;
  }

  function setX(x) {
    this.x = x;
  }

  function getY() {
    return this.y;
  }

  function setY(y) {
    this.y = y;
  }

  function getAngle() {
    return this.angle;
  }

  function setAngle(angle) {
    this.angle = angle;
  }

  function getMessage() {
    return this.message;
  }

  function setMessage(message) {
    this.message = message;
  }

  function getLatestUpdate() {
    return this.LatestUpdate;
  }

  // unused
  // function setLatestUpdate(unix) {
  //   this.latestUpdate = unix;
  // }

  function updateLatestUpdate() {
    this.latestUpdate = util.getCurrentUtcTimestamp();
  }

  function updateLatestTyping() {
    this.latestTyping = util.getCurrentUtcTimestamp();
  }

  function getPosition() {
    return {
      x: this.x,
      y: this.y,
      angle: this.angle,
    }
  }

  function updatePosition(position) {
    this.x = position.x;
    this.y = position.y;
    this.angle = position.angle;
  }

  return {
    // public for client
    // private for server
    playerId: this.playerId,
    playerType: this.playerType,
    x: this.x,
    y: this.y,
    angle: this.angle,
    message: this.message,
    latestUpdate: this.latestUpdate,
    latestTyping: this.latestTyping,

    // public for server
    getPlayerId: getPlayerId,
    getPlayerType: getPlayerType,
    getX: getX,
    setX: setX,
    getY: getY,
    setY: setY,
    getAngle: getAngle,
    setAngle: setAngle,
    getMessage: getMessage,
    setMessage: setMessage,

    getLatestUpdate: this.getLatestUpdate,
    // setLatestUpdate: setLatestUpdate,
    updateLatestUpdate: updateLatestUpdate,
    updateLatestTyping: updateLatestTyping,

    getPosition: getPosition,
    updatePosition: updatePosition,
  }
}

module.exports = Player;
