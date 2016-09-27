/**
 * Blocker game
 */

var config = require('./../../../common/config'),
  util = require('./blocker/util'),
  boot = require('./blocker/boot'),
  load = require('./blocker/load'),
  play = (config.isOnline)
    ? require('./blocker/play.online')
    : require('./blocker/play.offline');

module.exports = {
  Util: util,
  Boot: boot,
  Load: load,
  Play: play,
};
