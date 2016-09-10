var util = require('./../common/util');

var Player = function(playerId, startX, startY, startAngle, latestUpdate) {
  this.playerId = playerId;
  this.x = startX;
  this.y = startY;
  this.angle = startAngle;
  this.message = '';
  this.latestTyping = util.getCurrentUtcTimestamp();
  this.latestUpdate = util.getCurrentUtcTimestamp(); // ignore typing

  function getX() {
    return this.x;
  }

  function setX(x) {
    this.updateLatestUpdate();
    this.x = x;
  }

  function getY() {
    return this.y;
  }

  function setY(y) {
    this.updateLatestUpdate();
    this.y = y;
  }

  function getAngle() {
    return this.angle;
  }

  function setAngle(angle) {
    this.updateLatestUpdate();
    this.angle = angle;
  }

  function getMessage() {
    return this.message;
  }

  function setMessage(message) {
    this.updateLatestUpdate();
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

  return {
    // public for client
    // private for server
    playerId: this.playerId,
    x: this.x,
    y: this.y,
    angle: this.angle,
    message: this.message,
    latestUpdate: this.latestUpdate,
    latestTyping: this.latestTyping,

    // public for server
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
    updateLatestTyping: updateLatestTyping
  }
}

module.exports = Player
