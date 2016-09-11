// client config
var clientConfig = {
  
};

// app
var CONFIG = config, // common config
  CLIENT_CONFIG = clientConfig, // unused
  SOCKET_URL = 'http://' + location.hostname + ':' + CONFIG.serverPort,
  SOCKET = io(SOCKET_URL),
  EVENT_NAME = CONFIG.eventName,
  WINDOW_WIDTH = window.innerWidth,
  WINDOW_HEIGHT = window.innerHeight,
  CLIENT_HEARTHBEAT = 1000;

// game
var GAME = new Phaser.Game(WINDOW_WIDTH, WINDOW_HEIGHT, Phaser.CANVAS, 'game-wrap');
