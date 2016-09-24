var CONFIG = require('./config'),
  UI = require('./../ui'),
  DATA = require('./../../../../common/data'),
  MODULE = require('./../../../../common/module'),
  Position = MODULE.Position,
  Vector = MODULE.Vector,
  Hero = MODULE.Hero,
  Zombie = MODULE.Zombie,
  Machine = MODULE.Machine,
  Bat = MODULE.Bat;

Play = function(GAME) {
  
  this.nZombies = 8;
  this.nMachines = 8;
  this.nBats = 8;

  /** @type {Array.number} map that can tell which point is walkable */
  this.VTMap = {};

  // floor
  this.floorGroup;
  this.vtmapDebugGroup;
  this.stoneShadowGroup;
  this.stoneGroup;

  // item
  this.potionGroup; // unused

  // monster
  this.zombieShadowGroup;
  this.zombieWeaponGroup;
  this.zombieGroup;
  this.machineShadowGroup;
  this.machineWeaponGroup;
  this.machineGroup;
  this.batShadowGroup;
  this.batWeaponGroup;
  this.batGroup;

  // hero
  this.enemyShadowGroup; // unused
  this.enemyGroup; // unused
  this.playerShadowGroup;
  this.playerWeaponGroup;
  this.playerGroup;

  // emitter
  this.dashEmitterGroup;
  this.damageEmitterGroup;
  this.recoverEmitterGroup;

  // bullet
  this.playerArrowGroup;
  this.machineLaserGroup;

  // sky
  this.treeGroup;
  this.skyGroup; // unused
  this.nameGroup; // unused
  
  // input
  this.cursors; // unused
  this.spaceKey;
  this.enterKey;
};

Play.prototype = {

  getRandomCreaturePosition: function() {
    var x = UTIL.getRandomInt(0, GAME_WORLD_WIDTH),
      y = UTIL.getRandomInt(0, GAME_WORLD_HEIGHT),
      result = new Position(x, y);

    console.log(result);

    return result;
  },

  setCreatureLabel: function(creature) {
    var labelStyle = {
        font: '13px ' + CONFIG.mainFontFamily,
        fill: '#fff',
        align: 'left',
      },
      label = GAME.add.text(0, 0, '', labelStyle);

    creature.addChild(label);
    creature.blr.label = label;
    this.updateCreatureLabel(creature);
  },

  updateCreatureLabel: function(creature) {
    this.updateCreatureLabelText(creature);

    // update label position only 1 time
    // cause we using `child`
    this.updateCreatureLabelPosition(creature);
  },

  updateCreatureLabelText: function(creature) {
    var labeltext = creature.blr.info.id + ' ' + creature.blr.info.life;
    creature.blr.label.setText(labeltext);
  },

  updateCreatureLabelPosition: function(creature) {
    var labelLeftOffset = 0,
      labelTopOffset = -10;

    creature.blr.label.x = -(creature.blr.label.width / 2) - labelLeftOffset;
    creature.blr.label.y = -(creature.height / 2) - (creature.blr.label.height / 2) + labelTopOffset;
  },

  updateCreatureLastPosition: function(creature) {
    creature.blr.lastPos = {
      x: creature.x,
      y: creature.y,
      rotation: creature.rotation,
    };
  },

  logCreatureRespawning: function(creature) {
    var logText = creature.blr.misc.creatureType + ' ' + creature.blr.info.id +
      ' (' + creature.blr.info.life + ') is respawn at ' + creature.body.x + ', ' + creature.body.y;
    UI.addTextToLogList(logText);
  },

  /**
   * Spawn zombie
   */
  spawnZombie: function() {
    // init
    var monsterBlr = new Zombie();
    var monster = this.spawnMonster(this.zombieGroup, monsterBlr.phrInfo);
    monster.blr = monsterBlr;
    this.updateCreatureLastPosition(monster);
    monster.animations.add('blink', [0, 1, 0]);
    monster.body.collideWorldBounds = true;
    this.setCreatureLabel(monster);

    // shadow
    var shadow = GAME.add.sprite(monster.x, monster.y, 'shadow');
    shadow.anchor.set(0.1);
    shadow.scale.setTo(0.7, 0.7);
    shadow.alpha = .3;
    monster.blr.shadow = shadow;
    this.zombieShadowGroup.add(monster.blr.shadow);

    // weapon
    var weapon = GAME.add.sprite(monster.x, monster.y, 'handsWeapon');
    weapon.anchor.set(0.5);
    weapon.animations.add('attack', [0, 1, 2, 3, 4]);
    weapon.animations.play('attack', 10, true, false);
    GAME.physics.enable(weapon);
    monster.blr.weapon = weapon;
    this.zombieWeaponGroup.add(monster.blr.weapon);

    // optional

    // misc
    this.logCreatureRespawning(monster);
  },

  spawnMachine: function() {
    // init
    var monsterBlr = new Machine();
    var monster = this.spawnMonster(this.machineGroup, monsterBlr.phrInfo);
    monster.blr = monsterBlr;
    this.updateCreatureLastPosition(monster);
    monster.animations.add('blink', [0, 1, 0]);
    monster.body.collideWorldBounds = true;
    this.setCreatureLabel(monster);

    // shadow
    var shadow = GAME.add.sprite(monster.x, monster.y, 'shadow');
    shadow.anchor.set(0.1);
    shadow.scale.setTo(0.7, 0.7);
    shadow.alpha = .3;
    monster.blr.shadow = shadow;
    this.machineShadowGroup.add(monster.blr.shadow);

    // weapon
    var weapon = GAME.add.sprite(monster.x, monster.y, 'laserTurretWeapon');
    weapon.anchor.set(0.5);
    weapon.animations.add('attack', [0, 1, 2]);
    weapon.animations.play('attack', 10, true, false);
    GAME.physics.enable(weapon);
    monster.blr.weapon = weapon;
    this.machineWeaponGroup.add(monster.blr.weapon);

    // bullet
    var bulletGroup = GAME.add.group();
    bulletGroup.enableBody = true;
    bulletGroup.physicsBodyType = Phaser.Physics.ARCADE;
    bulletGroup.createMultiple(monster.blr.misc.nBullets, 'laserBullet');
    bulletGroup.setAll('anchor.x', 0.5);
    bulletGroup.setAll('anchor.y', 0.5);
    bulletGroup.setAll('outOfBoundsKill', true);
    bulletGroup.setAll('checkWorldBounds', true);
    monster.bulletGroup = bulletGroup;

    // optional

    // misc
    this.logCreatureRespawning(monster);
  },

  /**
   * Spawn bat monster
   */
  spawnBat: function() {
    // init
    var monsterBlr = new Bat();
    var monster = this.spawnMonster(this.batGroup, monsterBlr.phrInfo);
    monster.blr = monsterBlr;
    this.updateCreatureLastPosition(monster);
    monster.animations.add('blink', [0, 1, 0]);
    monster.body.collideWorldBounds = true;
    this.setCreatureLabel(monster);

    // shadow
    var shadow = GAME.add.sprite(monster.x, monster.y, 'shadow');
    shadow.anchor.set(0.1);
    shadow.scale.setTo(0.5, 0.5);
    shadow.alpha = .3;
    monster.blr.shadow = shadow;
    this.batShadowGroup.add(monster.blr.shadow);

    // weapon
    var weapon = GAME.add.sprite(monster.x, monster.y, 'wingsWeapon');
    weapon.anchor.set(0.5);
    weapon.animations.add('attack', [0, 1, 2, 3]);
    weapon.animations.play('attack', 10, true, false);
    GAME.physics.enable(weapon);
    monster.blr.weapon = weapon;
    this.batWeaponGroup.add(monster.blr.weapon);

    // optional
    monster.scale.setTo(0.7, 0.7);
    monster.blr.weapon.scale.setTo(0.7, 0.7);

    // misc
    this.logCreatureRespawning(monster);
  },

  /**
   * Spawn monster
   * 
   * @param {Array.Group} monsterGroup - array of Phaser Group
   * @param {CreatureInfo} monsterPhrInfo
   * @param {number}
   * @return {DisplayObject} Phaser DisplayObject
   */
  spawnMonster: function(monsterGroup, monsterPhrInfo, startPosX, startPosY) {
    if (typeof startPosX === 'undefined') startPosX = UTIL.getRandomInt(0, GAME_WORLD_WIDTH);
    if (typeof startPosY === 'undefined') startPosY = UTIL.getRandomInt(0, GAME_WORLD_HEIGHT);
    var monsterSpriteName = monsterPhrInfo.spriteName,
      monsterBodyOffset = monsterPhrInfo.bodyOffset,
      monsterBodyWidth = monsterPhrInfo.width,
      monsterBodyHeight = monsterPhrInfo.height,
      monsterBodyWidthSize = monsterBodyWidth - monsterBodyOffset * 2,
      monsterBodyHeightSize = monsterBodyHeight - monsterBodyOffset * 2,
      monsterBodyMass = monsterPhrInfo.bodyMass;

    var monster = monsterGroup.create(startPosX, startPosY, monsterSpriteName);
    GAME.physics.enable(monster);
    monster.anchor.set(0.5);
    monster.body.setSize(
      monsterBodyWidthSize,
      monsterBodyHeightSize,
      monsterBodyOffset,
      monsterBodyOffset
    );
    monster.body.tilePadding.set(monsterBodyOffset, monsterBodyOffset);
    monster.body.mass = monsterBodyMass;

    return monster;
  },

  /**
   * Callback event when hit well
   * 
   * @param {[type]} creature [description]
   * @param {[type]} tile     [description]
   */
  onCreatureOverlapWell: function(creature, tile) {
    // console.log('onCreatureOverlapWell - ' + creature.blr.info.id + ' is on well');

    this.onCreatureIsRecovered(creature, 'well');
  },

  onCreatureIsRecovered: function(creature, recoveredFrom) {
    if (creature.blr.info.life < creature.blr.info.maxLife) {
      var ts = UTIL.getCurrentUtcTimestamp();

      if (ts > creature.blr.info.lastRecoverTimestamp + creature.blr.info.immortalDelay) {
        var logText = '+1 life ' + creature.blr.misc.creatureType + ' ' + creature.blr.info.id +
          ' (' + creature.blr.info.life++ + ' > ' + creature.blr.info.life + ')  was recovered from ' + recoveredFrom;
        UI.addTextToLogList(logText);

        creature.blr.info.updateLastRecoverTimestamp();
        this.playRecoverParticle(creature);
        creature.animations.play('recover', 10, false, false);

        this.updateCreatureLabelText(creature);
      }
    }
  },

  /**
   * Callback event when hit fire
   * 
   * @param {[type]} creature [description]
   * @param {[type]} tile     [description]
   */
  onCreatureOverlapFire: function(creature, tile) {
    // console.log('onCreatureOverlapFire - ' + creature.blr.info.id + ' is on fire');

    this.onCreatureIsDamaged(creature, 'fire');
  },

  /**
   * When creature is damaged
   * 
   * @param {Object} creature - creature object
   * @param {string} damageFrom - where is the damage come frome
   */
  onCreatureIsDamaged: function(creature, damageFrom) {
    var ts = UTIL.getCurrentUtcTimestamp();

    if (ts > creature.blr.info.lastDamageTimestamp + creature.blr.info.immortalDelay) {
      var logText = '-1 life ' + creature.blr.misc.creatureType + ' ' + creature.blr.info.id +
        ' (' + creature.blr.info.life-- + ' > ' + creature.blr.info.life + ')  was damaged from ' + damageFrom;
      UI.addTextToLogList(logText);

      creature.blr.info.updateLastDamageTimestamp();
      this.playDamageParticle(creature);
      creature.animations.play('blink', 10, false, false);

      // is die
      if (creature.blr.info.life <= 0) {
        var logText = creature.blr.misc.creatureType + ' ' + creature.blr.info.id + ' was died by ' + damageFrom;
        UI.addTextToLogList(logText);

        // disable - kill monster @24092016-0120
        //
        // creature.alive = false;
        // creature.kill();
        // creature.blr.weapon.kill();
        // creature.blr.shadow.kill();

        // respawn
        // - set init info
        // - random position
        this.respawnCreature(creature);

      } else {
        this.updateCreatureLabelText(creature);
      }
    }
  },

  /**
   * Respawn creature
   * 
   * @param {[type]} creature
   */
  respawnCreature: function(creature) {
    var newPosition = this.getRandomCreaturePosition();

    creature.blr.info.init();
    creature.reset(newPosition.x, newPosition.y);
    this.updateCreatureLabelText(creature);
    this.updateCreatureWeapon(creature);
    this.updateCreatureShadow(creature);
    this.logCreatureRespawning(creature);
  },

  onOverlapStone: function() {
    console.log('onOverlapStone');
  },

  onOverlapBush: function() {
    console.log('onOverlapBush');
  },

  setDashEmitter: function() {
    var nEmitter = 60;

    this.dashEmitterGroup = GAME.add.emitter(0, 0, nEmitter);
    this.dashEmitterGroup.makeParticles('dashParticle');
    this.dashEmitterGroup.gravity = 0;
    this.dashEmitterGroup.minRotation = 0;
    this.dashEmitterGroup.maxRotation = 0;
    this.dashEmitterGroup.minParticleSpeed.setTo(-40, -40);
    this.dashEmitterGroup.maxParticleSpeed.setTo(40, 40);
    this.dashEmitterGroup.bounce.setTo(0.5, 0.5);
  },

  setRecoverEmitter: function() {
    var nEmitter = 30;

    this.recoverEmitterGroup = GAME.add.emitter(0, 0, nEmitter);
    this.recoverEmitterGroup.makeParticles('recoverParticle');
    this.recoverEmitterGroup.gravity = 0;
    this.recoverEmitterGroup.minParticleSpeed.setTo(-200, -200);
    this.recoverEmitterGroup.maxParticleSpeed.setTo(200, 200);
  },

  setDamageEmitter: function() {
    var nEmitter = 30;

    this.damageEmitterGroup = GAME.add.emitter(0, 0, nEmitter);
    this.damageEmitterGroup.makeParticles('damageParticle');
    this.damageEmitterGroup.gravity = 0;
    this.damageEmitterGroup.minParticleSpeed.setTo(-200, -200);
    this.damageEmitterGroup.maxParticleSpeed.setTo(200, 200);
  },

  playDashParticle: function(creature) {
    this.dashEmitterGroup.x = creature.x;
    this.dashEmitterGroup.y = creature.y;
    this.dashEmitterGroup.start(true, 280, null, 20);
  },

  playRecoverParticle: function(creature) {
    this.recoverEmitterGroup.x = creature.x;
    this.recoverEmitterGroup.y = creature.y;
    this.recoverEmitterGroup.start(true, 280, null, 20);
  },

  playDamageParticle: function(creature) {
    this.damageEmitterGroup.x = creature.x;
    this.damageEmitterGroup.y = creature.y;
    this.damageEmitterGroup.start(true, 280, null, 20);
  },

  fadeDashEmitter: function() {
    this.dashEmitterGroup.forEachAlive(function(particle) {
      particle.alpha = GAME.math.clamp(particle.lifespan / 100, 0, 1);
    }, this);
  },

  fadeRecoverEmitter: function() {
    this.recoverEmitterGroup.forEachAlive(function(particle) {
      particle.alpha = GAME.math.clamp(particle.lifespan / 100, 0, 1);
    }, this);
  },

  fadeDamageEmitter: function() {
    this.damageEmitterGroup.forEachAlive(function(particle) {
      particle.alpha = GAME.math.clamp(particle.lifespan / 100, 0, 1);
    }, this);
  },

  fadeAllEmitters: function() {
    this.fadeDashEmitter();
    this.fadeRecoverEmitter();
    this.fadeDamageEmitter();
  },

  preload: function() {
    
  },

  init: function() {

    // floor
    this.floorGroup = GAME.add.group();
    this.stoneShadowGroup = GAME.add.group();
    this.stoneGroup = GAME.add.group();
    this.vtmapDebugGroup = GAME.add.group();

    // item
    this.potionGroup = GAME.add.group(); // unused

    // monster
    this.zombieShadowGroup = GAME.add.group();
    this.zombieWeaponGroup = GAME.add.group();
    this.zombieGroup = GAME.add.group();
    this.machineShadowGroup = GAME.add.group();
    this.machineWeaponGroup = GAME.add.group();
    this.machineGroup = GAME.add.group();
    this.batShadowGroup = GAME.add.group();
    this.batWeaponGroup = GAME.add.group();
    this.batGroup = GAME.add.group();

    // hero
    this.enemyShadowGroup = GAME.add.group(); // unused
    this.enemyGroup = GAME.add.group(); // unused
    this.playerShadowGroup = GAME.add.group();
    this.playerWeaponGroup = GAME.add.group();
    this.playerGroup = GAME.add.group();

    // bullet
    this.playerArrowGroup = GAME.add.group();
    this.machineLaserGroup = GAME.add.group();

    // sky
    this.treeGroup = GAME.add.group();
    this.skyGroup = GAME.add.group();
    this.nameGroup = GAME.add.group();

    // disable default right-click's behavior on the canvas
    GAME.canvas.oncontextmenu = function(e) {
      e.preventDefault()
    };

    // scale
    GAME.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    GAME.scale.pageAlignHorizontally = true;
    GAME.scale.pageAlignVertically = true;
    GAME.scale.setResizeCallback(function() {
      GAME.scale.setGameSize(window.innerWidth, window.innerHeight);
    });
  },

  debugMap: function() {
    var i = 0, // column
      j = 0, // row
      renderPadding = 4;
      mapData = this.VTMap.data,
      mapTileWidth = this.VTMap.mapTileWidth,
      mapTileHeight = this.VTMap.mapTileHeight,
      nTileWidth = this.VTMap.nTileWidth,
      nTileHeight = this.VTMap.nTileHeight;
    
    console.log(mapData);
  
    var bmdWidth = mapTileWidth - renderPadding * 2,
      bmdHeight = mapTileHeight - renderPadding * 2;

    var bmd = GAME.add.bitmapData(bmdWidth, bmdHeight);
    bmd.ctx.beginPath();
    bmd.ctx.rect(0, 0, bmdWidth, bmdHeight);
    bmd.ctx.fillStyle = 'rgba(240, 240, 100, .6)';
    bmd.ctx.fill();

    for (i = 0; i < nTileHeight; i++) {
      for (j = 0; j < nTileWidth; j++) {
        var mapPoint = mapData[i][j];

        // walkable
        if (mapPoint !== 0) {
          var x = (j * mapTileHeight) + renderPadding;
            y = (i * mapTileWidth) + renderPadding,
            drawnObject = GAME.add.sprite(x, y, bmd);

          this.vtmapDebugGroup.add(drawnObject);
        }
      }
    }
  },

  /**
   * Creature 2D array
   * 
   * @see http://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript
   * 
   * @param {number} nRows
   * @param {number} nCols
   * @param {any} defaultValue
   */
  creature2DArray: function(nRows, nCols, defaultValue) {
    var arr = [],
      i = 0,
      j = 0;

    for (i = 0; i < nRows; i++) {
      arr.push([]);
      arr[i].push(new Array(nCols));

      for (j = 0; j < nCols; j++) {
        arr[i][j] = defaultValue;
      }
    }

    return arr;
  },

  create: function() {
    // ping the server that game already setted
    //
    // SOCKET.emit(EVENT_NAME.player.ready, null);

    // world
    GAME.world.setBounds(0, 0, GAME_WORLD_WIDTH, GAME_WORLD_HEIGHT);

    // system & world
    GAME.physics.startSystem(Phaser.Physics.ARCADE);

    /*
    1: layer 1 - bush
    2: layer 0 - ground
    3: layer 1 - rock
    4: layer 2 - tree
    5: layer 0 - well
    6: layer 0 - fire
    */

    /*-------------------------------- Layer 0
     */

    // bg
    GAME.stage.backgroundColor = '#3db148';

    // map - floor
    var map = GAME.add.tilemap('mapTile');
    map.addTilesetImage('map');
    
    // VTMap
    this.VTMap.mapTileWidth = map.tileWidth;
    this.VTMap.mapTileHeight = map.tileHeight;
    this.VTMap.nTileWidth = map.width;
    this.VTMap.nTileHeight = map.height;
    this.VTMap.data = this.creature2DArray(
      this.VTMap.nTileWidth,
      this.VTMap.nTileHeight,
      0
    );

    this.floorGroup = map.createLayer(0);
    this.floorGroup.resizeWorld();
    map.setTileIndexCallback(5, this.onCreatureOverlapWell, this, this.floorGroup);
    map.setTileIndexCallback(6, this.onCreatureOverlapFire, this, this.floorGroup);
    map.forEach(function(tile) {
      if (tile.index === 5 || tile.index === 6) {

        // update VTMap
        this.VTMap.data[tile.y][tile.x] = tile.index;
      }
    }, this, 0, 0, 50, 50, this.floorGroup);

    // map - stone (rock, bush)
    this.stoneGroup = map.createLayer(1);
    map.setCollision([1, 3], true, this.stoneGroup);
    map.forEach(function(tile) {
      if (tile.index === 1 || tile.index === 3) {
        var stoneShadow = GAME.add.sprite(tile.worldX, tile.worldY, 'shadow');
        stoneShadow.scale.setTo(0.7, 0.7);
        stoneShadow.alpha = .3;
        this.stoneShadowGroup.add(stoneShadow);

        // update VTMap
        this.VTMap.data[tile.y][tile.x] = tile.index;
      }
    }, this, 0, 0, 50, 50, this.stoneGroup);

    // draw VTMap to game
    if (IS_DEBUG) {
      this.debugMap();
    }
    
    // emitter
    this.setDashEmitter();
    this.setRecoverEmitter();
    this.setDamageEmitter();

    // creature - zombie
    for (var i = 0; i < this.nZombies; i++) {
      this.spawnZombie();
    }

    // creature - machine
    for (var i = 0; i < this.nMachines; i++) {
      this.spawnMachine();
    }

    // creature - bat
    for (var i = 0; i < this.nBats; i++) {
      this.spawnBat();
    }

    // player
    var startPosX = 300;
    var startPosY = 90;
    var playerOffset = 8;
    var playerBodySize = 46 - playerOffset * 2;
    this.player = {};

    // player - shadow
    var shadowTmp = GAME.add.sprite(startPosX, startPosY, 'shadow');
    shadowTmp.anchor.set(0.1);
    shadowTmp.scale.setTo(0.7, 0.7);
    shadowTmp.alpha = .3;

    // player - weapon
    var weaponTmp = GAME.add.sprite(startPosX, startPosY, 'bowWeapon');
    weaponTmp.animations.add('attack', [0, 1, 2, 3, 4, 5, 0]);
    weaponTmp.anchor.set(0.3, 0.5);
    weaponTmp.scale.setTo(0.5);

    // player - body
    this.player = GAME.add.sprite(startPosX, startPosY, 'hero');
    this.player.blr = new Hero();
    this.updateCreatureLastPosition(this.player);
    this.player.animations.add('blink', [0, 1, 0]);
    this.player.animations.add('recover', [0, 2, 0]);
    this.player.anchor.set(0.5);
    GAME.physics.enable(this.player);
    this.player.body.collideWorldBounds = true;
    this.player.body.setSize(playerBodySize, playerBodySize, playerOffset, playerOffset);
    this.player.body.tilePadding.set(playerOffset, playerOffset);
    this.player.body.maxAngular = 500;
    this.player.body.angularDrag = 50;

    // player - bullet
    var bulletGroup = GAME.add.group();
    bulletGroup.enableBody = true;
    bulletGroup.physicsBodyType = Phaser.Physics.ARCADE;
    bulletGroup.createMultiple(this.player.blr.misc.nBullets, 'arrowBullet');
    bulletGroup.setAll('anchor.x', 0.5);
    bulletGroup.setAll('anchor.y', 0.5);
    bulletGroup.setAll('outOfBoundsKill', true);
    bulletGroup.setAll('checkWorldBounds', true);

    // player
    this.playerGroup.add(this.player);
    this.setCreatureLabel(this.player);
    this.player.blr.shadow = shadowTmp;
    this.playerShadowGroup.add(this.player.blr.shadow);
    this.player.blr.weapon = weaponTmp;
    this.playerWeaponGroup.add(this.player.blr.weapon);
    this.player.blr.bullet = bulletGroup;
    this.playerArrowGroup.add(this.player.blr.bullet);

    // map - tree
    this.treeGroup = map.createLayer(2);

    // camera
    GAME.camera.follow(this.player);

    // keyboard
    this.cursors = GAME.input.keyboard.createCursorKeys(); // unused
    this.spaceKey = GAME.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.enterKey = GAME.input.keyboard.addKey(Phaser.Keyboard.ENTER);

    // reorder z-index (hack)
    GAME.world.bringToTop(this.floorGroup);
    GAME.world.bringToTop(this.stoneShadowGroup);
    GAME.world.bringToTop(this.stoneGroup);
    GAME.world.bringToTop(this.vtmapDebugGroup);

    GAME.world.bringToTop(this.dashEmitterGroup);
    GAME.world.bringToTop(this.recoverEmitterGroup);
    GAME.world.bringToTop(this.damageEmitterGroup);

    GAME.world.bringToTop(this.potionGroup); // unused

    GAME.world.bringToTop(this.zombieShadowGroup);
    GAME.world.bringToTop(this.machineShadowGroup);
    GAME.world.bringToTop(this.batShadowGroup);
    GAME.world.bringToTop(this.enemyShadowGroup); // unused
    GAME.world.bringToTop(this.playerShadowGroup);

    GAME.world.bringToTop(this.zombieWeaponGroup);
    GAME.world.bringToTop(this.zombieGroup);
    GAME.world.bringToTop(this.machineGroup);
    GAME.world.bringToTop(this.machineWeaponGroup);
    GAME.world.bringToTop(this.batWeaponGroup);
    GAME.world.bringToTop(this.batGroup);

    GAME.world.bringToTop(this.playerWeaponGroup);
    GAME.world.bringToTop(this.enemyGroup); // unused
    GAME.world.bringToTop(this.playerGroup);

    GAME.world.bringToTop(this.playerArrowGroup);
    GAME.world.bringToTop(this.machineLaserGroup);

    GAME.world.bringToTop(this.treeGroup);
    GAME.world.bringToTop(this.skyGroup); // unused
    GAME.world.bringToTop(this.nameGroup); // unused
  },

  onPlayerOverlapZombie: function(player, monster) {
    // console.log('onPlayerOverlapZombie');
  },

  onPlayerOverlapMachine: function(player, monster) {
    // console.log('onPlayerOverlapMachine');
  },

  onPlayerOverlapBat: function(player, monster) {
    // console.log('onPlayerOverlapBat');
  },

  onPlayerOverlapZombieWeapon: function(player, monsterWeapon) {
    // console.log('onPlayerOverlapZombieWeapon');

    this.onCreatureIsDamaged(player, 'zombie');
  },

  onPlayerOverlapMachineWeapon: function(player, monsterWeapon) {
    // console.log('onPlayerOverlapMachineWeapon');

    this.onCreatureIsDamaged(player, 'machine');
  },

  onPlayerOverlapBatWeapon: function(player, monsterWeapon) {
    // console.log('onPlayerOverlapBatWeapon');

    this.onCreatureIsDamaged(player, 'bat');
  },

  onMachineLaserOverlapPlayer: function(laser, player) {
    // console.log('onMachineLaserOverlapPlayer')
  },

  onPlayerArrowOverlapStoneGroup: function(arrow, stone) {
    // console.log('onPlayerArrowOverlapStoneGroup');
  },

  onPlayerArrowOverlapMonster: function(arrow, monster) {
    // console.log('onPlayerArrowOverlapMonster');

    this.playDamageParticle(monster);
    arrow.kill();
    this.onCreatureIsDamaged(monster, 'arrow');
  },

  update: function() {
    // collide - creature with floorGroup
    GAME.physics.arcade.collide(this.zombieGroup, this.floorGroup);
    GAME.physics.arcade.collide(this.machineGroup, this.floorGroup);
    GAME.physics.arcade.collide(this.batGroup, this.floorGroup);
    GAME.physics.arcade.collide(this.playerGroup, this.floorGroup);

    // collide - creature with stoneGroup
    GAME.physics.arcade.collide(this.zombieGroup, this.stoneGroup);
    GAME.physics.arcade.collide(this.machineGroup, this.stoneGroup);
    GAME.physics.arcade.collide(this.batGroup, this.stoneGroup);
    GAME.physics.arcade.collide(this.playerGroup, this.stoneGroup);

    // collide - player with monster
    GAME.physics.arcade.collide(this.playerGroup, this.zombieGroup);
    GAME.physics.arcade.collide(this.playerGroup, this.machineGroup);
    GAME.physics.arcade.collide(this.playerGroup, this.batGroup);

    // overlap - player with monster
    GAME.physics.arcade.overlap(this.playerGroup, this.zombieGroup, this.onPlayerOverlapZombie, null, this);
    GAME.physics.arcade.overlap(this.playerGroup, this.machineGroup, this.onPlayerOverlapMachine, null, this);
    GAME.physics.arcade.overlap(this.playerGroup, this.batGroup, this.onPlayerOverlapBat, null, this);

    // overlap - player with monster weapon
    GAME.physics.arcade.overlap(this.playerGroup, this.zombieWeaponGroup, this.onPlayerOverlapZombieWeapon, null, this);
    GAME.physics.arcade.overlap(this.playerGroup, this.machineWeaponGroup, this.onPlayerOverlapMachineWeapon, null, this);
    GAME.physics.arcade.overlap(this.playerGroup, this.batWeaponGroup, this.onPlayerOverlapBatWeapon, null, this);

    // overlap - player arrow with monster
    GAME.physics.arcade.overlap(this.playerArrowGroup, this.zombieGroup, this.onPlayerArrowOverlapMonster, null, this);
    GAME.physics.arcade.overlap(this.playerArrowGroup, this.machineGroup, this.onPlayerArrowOverlapMonster, null, this);
    GAME.physics.arcade.overlap(this.playerArrowGroup, this.batGroup, this.onPlayerArrowOverlapMonster, null, this);

    // player
    if (this.player.alive) {

      // reset
      this.player.body.velocity.x = 0;
      this.player.body.velocity.y = 0;
      this.player.body.angularVelocity = 0;

      // input - left click
      if (GAME.input.activePointer.leftButton.isDown) {
        // move

        var playerSpeed = 200;
        GAME.physics.arcade.moveToPointer(this.player, playerSpeed);

        //  if it's overlapping the mouse, don't move any more
        if (Phaser.Rectangle.contains(this.player.body, GAME.input.x, GAME.input.y)) {
          this.player.body.velocity.setTo(0, 0);

        } else {
          // update player + weapon rotation
          this.updateCreatureRotationByFollowingMouse(this.player);
          this.playDashParticle(this.player);
        }
      }

      // input -  right
      if (GAME.input.activePointer.rightButton.isDown ||
        this.spaceKey.isDown) {
        // fire arrow
        this.heroFireArrow(this.player);
      }

      this.updateCreatureLastPosition(this.player);
    }

    // monster - zombie
    this.zombieGroup.forEachAlive(function(monster) {
      this.updateCreatureLabelText(monster);
    }, this);

    // monster - machine
    /*
    this.machineGroup.forEachAlive(function(monster) {
      if (GAME.physics.arcade.distanceBetween(monster, this.player) < monster.blr.misc.visibleRange) {
        var ts = UTIL.getCurrentUtcTimestamp();

        if (ts > monster.nextFireTimestamp &&
          monster.bulletGroup.countDead() > 0) {

          monster.nextFireTimestamp = UTIL.getCurrentUtcTimestamp() + monster.fireRate; 
          var bullet = monster.blr.bullet.getFirstDead();
          bullet.reset(monster.blr.weapon.x, monster.blr.weapon.y);
          bullet.rotation = GAME.physics.arcade.moveToObject(bullet, this.player, monster.bulletSpeed);
        }
      }
    }, this);
    */

    // monster - bat
    this.batGroup.forEachAlive(function(monster) {
      this.updateCreatureLabelText(monster);
    }, this);
  },

  heroFireArrow: function(hero) {
    var ts = UTIL.getCurrentUtcTimestamp();

    if (ts > hero.blr.misc.nextFireTimestamp &&
      hero.blr.bullet.countDead() > 0) {

      // update player + weapon rotation
      this.updateCreatureRotationByFollowingMouse(hero);

      // update bullet
      // 2 bullet/sec (cause we have 7 frame per animation)
      hero.blr.weapon.animations.play('attack', 14, false, false);
      hero.blr.misc.nextFireTimestamp = ts + hero.blr.misc.fireRate;

      var bullet = hero.blr.bullet.getFirstExists(false);
      bullet.reset(hero.blr.weapon.x, hero.blr.weapon.y);
      bullet.rotation = GAME.physics.arcade.moveToPointer(
        bullet,
        hero.blr.misc.bulletSpeed,
        GAME.input.activePointer
      );
    }
  },

  /**
   * get rotation between creature and mouse
   * 
   * @param {[type]} creature
   * @returns {number} rotation
   */
  getRotationBetweenCreatureAndMouse: function(creature) {
    var result = Math.atan2(
      GAME.input.y - (creature.position.y - GAME.camera.y),
      GAME.input.x - (creature.position.x - GAME.camera.x)
    );

    return result;
  },

  /**
   * Update creature follow the mouse
   * So, this function will update
   * - body rotation
   * - weapon rotation
   * 
   * @param {[type]} creature
   */
  updateCreatureRotationByFollowingMouse: function(creature) {
    var newX = creature.x,
      newY = creature.y,
      newRotation = this.getRotationBetweenCreatureAndMouse(creature);

    creature.rotation = newRotation;
    this.updateCreatureWeapon(creature);
  },

  isCreatureMove: function(creature) {
    return (creature.x !== creature.blr.lastPos.x || creature.y !== creature.blr.lastPos.y);
  },

  isCreatureRotate: function(creature) {
    return (creature.rotation !== creature.blr.lastPos.rotation);
  },

  /**
   * Update creature shadow
   * using creature position by default
   * 
   * @param {[type]} creature
   * @param {number} [newX]
   * @param {number} [newY]
   */
  updateCreatureShadow: function(creature, newX, newY) {
    if (typeof newX === 'undefined') newX = creature.x;
    if (typeof newY === 'undefined') newY = creature.y;

    if (creature.alive) {
      if (this.isCreatureMove(creature)) {
        creature.blr.shadow.x = newX;
        creature.blr.shadow.y = newY;
      }
    }
  },

  /**
   * Update creature weapon Vector
   * using creature position by default
   * 
   * @param {[type]} creature
   * @param {number} [newX]
   * @param {number} [newY]
   * @param {number} [newRotation]
   */
  updateCreatureWeapon: function(creature, newX, newY, newRotation) {
    if (typeof newX === 'undefined') newX = creature.x;
    if (typeof newY === 'undefined') newY = creature.y;
    if (typeof newRotation === 'undefined') newRotation = creature.rotation;

    if (creature.alive) {
      if (this.isCreatureMove(creature)) {
        creature.blr.weapon.x = newX;
        creature.blr.weapon.y = newY;
      }

      creature.blr.weapon.rotation = newRotation;
    }
  },

  preRender: function() {
    // All shadow will update here

    this.updateCreatureShadow(this.player);

    this.zombieGroup.forEachAlive(function(monster) {
      this.updateCreatureWeapon(monster);
      this.updateCreatureShadow(monster);
    }, this);

    this.machineGroup.forEachAlive(function(monster) {
      var newX = monster.x,
        newY = monster.y,
        newRotation = GAME.physics.arcade.angleBetween(monster, this.player);

      this.updateCreatureWeapon(monster, newX, newY, newRotation);
      this.updateCreatureShadow(monster);
    }, this);

    this.batGroup.forEachAlive(function(monster) {
      this.updateCreatureWeapon(monster);
      this.updateCreatureShadow(monster);
    }, this);
  },

  render: function() {
    if (IS_DEBUG) {
      var creatureBodyDebugColor = 'rgba(0,255, 0, 0.4)',
        weaponBodyDebugColor = 'rgba(215, 125, 125, 0.4)';

      // top
      GAME.debug.bodyInfo(this.player, 32, 32);
      GAME.debug.spriteInfo(this.player, 32, 164);

      // middle
      GAME.debug.start(32, 260);
      GAME.debug.line('zombieGroup living ' + this.zombieGroup.countLiving());
      GAME.debug.line('zombieGroup dead ' + this.zombieGroup.countDead());
      GAME.debug.line('machineGroup living ' + this.machineGroup.countLiving());
      GAME.debug.line('machineGroup dead ' + this.machineGroup.countDead());
      GAME.debug.line('batGroup living ' + this.batGroup.countLiving());
      GAME.debug.line('batGroup dead ' + this.batGroup.countDead());
      GAME.debug.stop();

      // weapon body
      GAME.debug.body(this.player.blr.weapon, creatureBodyDebugColor);

      this.zombieWeaponGroup.forEachAlive(function(weapon) {
        GAME.debug.body(weapon, weaponBodyDebugColor);
      }, this);

      this.machineWeaponGroup.forEachAlive(function(weapon) {
        GAME.debug.body(weapon, weaponBodyDebugColor);
      }, this);

      this.batWeaponGroup.forEachAlive(function(weapon) {
        GAME.debug.body(weapon, weaponBodyDebugColor);
      }, this);

      // creature body
      GAME.debug.body(this.player, creatureBodyDebugColor);

      this.zombieGroup.forEachAlive(function(monster) {
        GAME.debug.body(monster, creatureBodyDebugColor);
      }, this);

      this.machineGroup.forEachAlive(function(monster) {
        GAME.debug.body(monster, creatureBodyDebugColor);
      }, this);

      this.batGroup.forEachAlive(function(monster) {
        GAME.debug.body(monster, creatureBodyDebugColor);
      }, this);
    }
  }
};

module.exports = Play;
