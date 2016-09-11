// Player, Enemy are created by Hero
// - phs  : Phaser object
// - info : info for sending to the server
//          `latestTyping`, `latestUpdate` properties
//          should not be updated by client
var PLAYER = {};

// Game
var BLOCKER = {},
  MAIN_FONT_FAMILY = 'Arial',
  SCREEN_COLOR = '#dedede',
  ASSET_PATH = '/public/assets',
  GAME_WORLD_WIDTH = CONFIG.game.worldWidth,
  GAME_WORLD_HEIGHT = CONFIG.game.worldHeight,
  HERO_SPEED = 500,
  CURRENT_SPEED = HERO_SPEED, // ????
  CURSORS,
  LAND,
  ENEMIES = [],
  IS_GAME_READY = false;

var IS_DEBUG = false,
  STARTED_DEBUG_XPOS = 400, // unused
  STARTED_DEBUG_YPOS = 8, // unused
  DEBUG_XPOS, // unused
  DEBUG_YPOS; // unused

// IS_DEBUG = true;

/*================================================================ Socket (connect, disconnect, first-time only)
*/

SOCKET.on('connect', function() {
  util.clientLog('Connected to ' + SOCKET_URL);

  // game
  ResetAllEnemies();
});

SOCKET.on('disconnect', function() {
  util.clientLog('Disconnected from ' + SOCKET_URL);
});

// player is ready
SOCKET.on(EVENT_NAME.player.ready, function(data) {
  console.log('Init data', data);  

  // bg
  LAND = GAME.add.tileSprite(0, 0, 2000, 2000, 'background');

  // game world
  GAME.world.setBounds(0, 0, 2000, 2000);

  // physics
  // GAME.physics.startSystem(Phaser.Physics.P2JS);
  GAME.physics.startSystem(Phaser.Physics.ARCADE);

  // player
  addPlayerToGame(data.playerInfo);

  // enemy
  addEnemiesToGame(data.existingPlayerInfos);

  // emitter
  
  // sound
  
  // label

  // input
  CURSORS = GAME.input.keyboard.createCursorKeys();

  // GAME.camera.deadzone = new Phaser.Rectangle(150, 150, WINDOW_WIDTH - 300, WINDOW_HEIGHT - 300);
  GAME.camera.focusOnXY(0, 0);

  // screen
  addPlayerToPlayerList(data.playerInfo, 'player');
  addPlayersToPlayerList(data.existingPlayerInfos, 'enemy');
  addPlayerMessagesToMessageList(data.existingChatLogs);

  setSocketHandlers();

  IS_GAME_READY = true;
});

/*---------------------------------------------------------------- Socket
*/

function setSocketHandlers() {
  // new player
  SOCKET.on(EVENT_NAME.server.newPlayer, onPlayerConnect);

  // disconnected player
  SOCKET.on(EVENT_NAME.server.disconnectedPlayer, onPlayerDisconnect);

  // message
  SOCKET.on(EVENT_NAME.player.message, onPlayerMessage);

  // typing
  SOCKET.on(EVENT_NAME.player.typing, onPlayerTyping);

  // move
  SOCKET.on(EVENT_NAME.player.move, onPlayerMove);
}

function onPlayerConnect(newPlayer) {
  util.clientLog('New player is connected', newPlayer);

  // screen
  addPlayerToPlayerList(newPlayer);

  // game
  var enemy = new Enemy(newPlayer);
  ENEMIES.push(enemy);
}

function onPlayerDisconnect(disconnectedPlayer) {
  util.clientLog('Player is disconnected', disconnectedPlayer);

  // screen
  removePlayerFromPlayerList(disconnectedPlayer);

  // game
  removeEnemyFromGame(disconnectedPlayer);
}

function onPlayerMessage(player) {
  util.clientLog('Receive the player message', player);

  // screen
  addPlayerMessageToMessageList(player);
}

function onPlayerTyping(player) {
  util.clientLog('Someone is typing');

  // system
  LATEST_TYPING = player.latestTyping;

  // screen
  addTypingStatus();
}

function onPlayerMove(player) {
  // util.clientLog('Enemy is move');

  // game
  var enemyIdx = getEnemyIndexById(player.playerId);

  if (enemyIdx > -1) {
    ENEMIES[enemyIdx].phs.x = player.x;
    ENEMIES[enemyIdx].phs.y = player.y;
    ENEMIES[enemyIdx].phs.angle = player.angle; // unused
  }
}

/*================================================================ Game util
*/

function addEnemiesToGame(enemyInfos) {
  var i = 0,
    nEnemies = enemyInfos.length;

  for (i = 0; i < nEnemies; i++) {
    addEnemyToGame(enemyInfos[i]);
  }
}

function addEnemyToGame(enemyInfo) {
  var enemy = new Enemy(enemyInfo);
  ENEMIES.push(enemy);
}

function removeEnemyFromGame(disconnectedPlayer) {
  var enemyIdx = getEnemyIndexById(disconnectedPlayer.playerId);

  if (enemyIdx > -1) {
    console.log(ENEMIES[enemyIdx]);

    ENEMIES[enemyIdx].phs.kill();
    ENEMIES.splice(enemyIdx, 1);
  }
}

function addPlayerToGame(playerInfo) {
  PLAYER = new Player(playerInfo);

  // camera
  GAME.camera.follow(PLAYER.phs);
}

// duplicated with getPlayerIndexById (server side)
function getEnemyIndexById(playerId) {
 var i = 0;
    nPlayers = ENEMIES.length,
    isFound = false;

  for (i = 0; i < nPlayers; i++) {
    if (ENEMIES[i].info.playerId == playerId) {
      return i;
    }
  }

  util.clientBugLog('getEnemyIndexById: not found ' + playerId);

  return -1;
}

function ResetAllEnemies() {
  ENEMIES.forEach(function(enemy) {
    enemy.player.kill();
  });

  ENEMIES = [];
}

/*================================================================ Boot
*/

BLOCKER.Boot = function(GAME) {};
BLOCKER.Boot.prototype = {
  init: function() {
    // TODO: Set ScaleManager

    // plugin: phaser-screen-shake
    // TODO: Fix camera bug when using this plugin
    // GAME.plugins.screenShake = GAME.plugins.add(Phaser.Plugin.ScreenShake);

    // plugin: phaser-state-transition
    /*
    GAME.stateTransitionExponential = GAME.plugins.add(Phaser.Plugin.StateTransition);
    GAME.stateTransitionExponential.configure({
      duration: Phaser.Timer.SECOND * 0.8,
      ease: Phaser.Easing.Exponential.InOut,
      properties: {
        alpha: 0,
        scale: {
          x: 1.2,
          y: 1.2
        }
      }
    });
    */
  },
  preload: function() {
    GAME.stage.backgroundColor = SCREEN_COLOR;

    GAME.load.image('loading',        ASSET_PATH + '/images/loading.png');
    GAME.load.image('loading-border', ASSET_PATH + '/images/loading-border.png');
  },
  create: function() {
    GAME.state.start('Load');
  }
};

/*================================================================ Load
*/

BLOCKER.Load = function(GAME) {};
BLOCKER.Load.prototype = {
  setPreloadingBg: function() {
    // GAME.stage.backgroundColor = SCREEN_COLOR;
  },
  setPreloadingImage: function() {
    var preloading = GAME.add.sprite(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2 + 30, 'loading');

    preloading.x -= preloading.width / 2;
    GAME.load.setPreloadSprite(preloading);
  },
  setPreloadingTitle: function() {
    var title = GAME.add.text(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2 - 20, 'Blocker - The Slayer', {
      font: '50px ' + MAIN_FONT_FAMILY,
      fill: '#545454'
    });

    var subTitle = GAME.add.text(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 'https://github.com/jojoee/blocker', {
      font: '16px ' + MAIN_FONT_FAMILY,
      fill: '#65655b'
    });

    title.anchor.setTo(0.5, 1);
    subTitle.anchor.setTo(0.5, 1);
  },
  preload: function() {
    this.setPreloadingBg();
    this.setPreloadingImage();
    this.setPreloadingTitle();

    // load all asets
    GAME.load.image('background',   ASSET_PATH + '/images/background.jpg');
    GAME.load.spritesheet('hero',   ASSET_PATH + '/images/hero.png', 64, 64);
    GAME.load.spritesheet('player', ASSET_PATH + '/images/player.png', 64, 64);
    GAME.load.spritesheet('enemy',  ASSET_PATH + '/images/enemy.png', 64, 64);
  },
  create: function() {
    // GAME.stateTransitionExponential.to('Play');
    GAME.state.start('Play');
  }
};


/*================================================================ Play
*/

BLOCKER.Play = function(GAME) {};
BLOCKER.Play.prototype = {
  // Debug
  // unused
  echoDebug: function(txt, val) {
    GAME.debug.text(txt + ': ' + val, DEBUG_XPOS, DEBUG_YPOS += 20);
  },

  // Label

  // Emitter
 
  // Event

  // State
  init: function() {

  },
  create: function() {
    // ping the server that game already setted, so now we need
    // - player data
    // - enemies data
    SOCKET.emit(EVENT_NAME.player.ready, null);
  },
  update: function() {
    if (IS_GAME_READY) {
      // enemy
      var i = 0,
        nEnemies = ENEMIES.length;
      
      for (i = 0; i < nEnemies; i++) {
        if (ENEMIES[i].info.alive) {
          ENEMIES[i].update();
          GAME.physics.arcade.collide(PLAYER.phs, ENEMIES[i].phs);
        }
      }

      // player
      PLAYER.phs.body.velocity.x = 0;
      PLAYER.phs.body.velocity.y = 0;

      // input
      // input: mouse
      /*
      if (GAME.input.mousePointer.isDown) {
        GAME.physics.arcade.moveToPointer(PLAYER.phs, CURRENT_SPEED);

        //  if it's overlapping the mouse, don't move any more
        if (Phaser.Rectangle.contains(PLAYER.phs.body, GAME.input.x, GAME.input.y)) {
          PLAYER.phs.body.velocity.setTo(0, 0);
        }

      } else {

      }
      */
      
      // input: cursors
      if (CURSORS.up.isDown) {
        PLAYER.phs.body.velocity.y = -CURRENT_SPEED;

      } else if (CURSORS.down.isDown) {
        PLAYER.phs.body.velocity.y = CURRENT_SPEED;
      }

      if (CURSORS.left.isDown) {
        PLAYER.phs.body.velocity.x = -CURRENT_SPEED;

      } else if (CURSORS.right.isDown) {
        PLAYER.phs.body.velocity.x = CURRENT_SPEED;
      }

      if (PLAYER.phs.body.velocity.x == 0 &&
        PLAYER.phs.body.velocity.y == 0) {
        PLAYER.phs.animations.play('stop');

      } else {
        PLAYER.phs.animations.play('move');

        SOCKET.emit(EVENT_NAME.player.move, PLAYER.getPosition());
      }
    }
  },
  render: function() {
    if (IS_GAME_READY & IS_DEBUG) {
      GAME.debug.spriteInfo(LAND, 32, 200);
      GAME.debug.cameraInfo(GAME.camera, 32, 32);
      GAME.debug.spriteCoords(PLAYER.phs, 32, 500);      
    }
  }
};
