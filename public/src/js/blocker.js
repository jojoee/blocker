/**
 * Blocker game
 */

const boot = require('./blocker/boot')
const load = require('./blocker/load')
const play = require('./blocker/play')

module.exports = {
  Boot: boot,
  Load: load,
  Play: play
}
