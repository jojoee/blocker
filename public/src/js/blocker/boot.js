var CONFIG = require('./config');

Boot = function(GAME) {};
Boot.prototype = {
  init: function() {
    
  },
  preload: function() {
    GAME.stage.backgroundColor = CONFIG.screenColor;

    GAME.load.image('loading', CONFIG.assetPath + '/image/loading.png');
    GAME.load.image('loadingBorder', CONFIG.assetPath + '/image/loading-border.png');
  },
  create: function() {
    GAME.state.start('Load');
  }
};

module.exports = Boot;
