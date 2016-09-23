var CONFIG = require('./config');

Boot = function(GAME) {};
Boot.prototype = {
  init: function() {

    // plugin: phaser-screen-shake
    // TODO: Fix camera bug when using this plugin
    // GAME.plugins.screenShake = GAME.plugins.add(Phaser.Plugin.ScreenShake);

    // plugin: phaser-state-transition

    // GAME.stateTransitionExponential = GAME.plugins.add(Phaser.Plugin.StateTransition);
    // GAME.stateTransitionExponential.configure({
    //   duration: Phaser.Timer.SECOND * 0.8,
    //   ease: Phaser.Easing.Exponential.InOut,
    //   properties: {
    //     alpha: 0,
    //     scale: {
    //       x: 1.2,
    //       y: 1.2
    //     }
    //   }
    // });
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
