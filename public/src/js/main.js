/**
 * Client entry file
 */

console.log('Blocker - The Hunter is welcome!');

var config = require('./../../../common/config'),
  clientConfig = require('./config'),
  clientModule = require('./module'),
  socketUrl = location.protocol + '//' + location.hostname + ':' + config.serverPort;

window.FAKER = require('faker');
window.COMMON_MODULE = require('./../../../common/module');
window.EVENT_NAME = config.eventName;
window.IS_PROD = config.isProd;
window.IS_DEBUG = config.isDebug;
window.IS_DUMMY = config.isDummy;
window.IS_ONLINE = config.isOnline;
window.IS_IMMORTAL = config.isImmortal;
window.GAME_WORLD_WIDTH = config.game.worldWidth;
window.GAME_WORLD_HEIGHT = config.game.worldHeight;
window.SOCKET = io(socketUrl);
window.WINDOW_WIDTH = window.innerWidth;
window.WINDOW_HEIGHT = window.innerHeight;
window.CLIENT_HEARTHBEAT = 1000;
window.UI = require('./ui');
window.UTIL = require('./../../../common/util');
window.GAME = new Phaser.Game(WINDOW_WIDTH, WINDOW_HEIGHT, Phaser.CANVAS, 'game-wrap');

if (IS_DEBUG) {
  console.log('IS_PROD', IS_PROD);
  console.log('IS_ONLINE', IS_ONLINE);
  console.log('IS_DEBUG', IS_DEBUG);
  console.log('IS_DUMMY', IS_DUMMY);
  console.log('IS_IMMORTAL', IS_IMMORTAL);
}

if (IS_DUMMY) {
  UI.dummyPlayerList(60);
}

var blocker = require('./blocker');
blocker.Util.init();
UI.init();

GAME.state.add('Boot', blocker.Boot);
GAME.state.add('Load', blocker.Load);
GAME.state.add('Play', blocker.Play);

GAME.state.start('Boot');
