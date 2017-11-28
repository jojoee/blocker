/**
 * Blocker game
 */

var config = require('./../../../common/config'),
  boot = require('./blocker/boot'),
  load = require('./blocker/load'),
  play = require('./blocker/play')

module.exports = {
  Boot: boot,
  Load: load,
  Play: play
}
