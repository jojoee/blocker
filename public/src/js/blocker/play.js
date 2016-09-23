var CONFIG = require('./config'),
  UI = require('./../ui'),
  DATA = require('./../../../../common/data'),
  CREATURE_DATA = DATA.Creature,
  ITEM_DATA = DATA.Item;

Play = function(GAME) {
  this.cursors;

  this.nZombies = 8;
  this.nMachines = 8;
  this.nBats = 8;

  // floor
  this.floorGroup;
  this.stoneShadowGroup;
  this.stoneGroup;

  // item
  this.itemGroup;

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
};

Play.prototype = {

  setCreatureLabel: function(creature) {
    var labelStyle = {
        font: '13px ' + CONFIG.mainFontFamily,
        fill: '#fff',
        align: 'left',
      },
      label = GAME.add.text(0, 0, '', labelStyle);
    
    creature.addChild(label);
    creature.blrLabel = label;
    this.updateCreatureLabel(creature);
  },

  updateCreatureLabel: function(creature) {
    this.updateCreatureLabelText(creature);
    this.updateCreatureLabelPosition(creature);
  },

  updateCreatureLabelText: function(creature) {
    var labeltext = creature.blrInfo.id + ' ' + creature.blrInfo.life;
    creature.blrLabel.setText(labeltext);
  },

  updateCreatureLabelPosition: function(creature) {
    var labelLeftOffset = 0,
      labelTopOffset = -10;
      
    creature.blrLabel.x = -(creature.blrLabel.width / 2) - labelLeftOffset;
    creature.blrLabel.y = -(creature.height / 2) - (creature.blrLabel.height / 2) + labelTopOffset;
  },

  updateCreatureLastPosition: function(creature) {
    creature.blrLastPos = {
      x: creature.x,
      y: creature.y,
      rotation: creature.rotation
    };
  },

  /**
   * Spawn zombie
   */
  spawnZombie: function() {
    // init
    var monster = this.spawnMonster(this.zombieGroup, CREATURE_DATA.zombie.phrInfo);
    monster.animations.add('blink', [0, 1, 0]);
    monster.blr = CREATURE_DATA.zombie.blr;
    monster.blrInfo = CREATURE_DATA.zombie.blrInfo;
    monster.blrLastPos = CREATURE_DATA.zombie.blrLastPos;
    monster.blrLabel = CREATURE_DATA.zombie.blrLabel;
    monster.blrShadow = CREATURE_DATA.zombie.blrShadow;
    monster.blrWeapon = CREATURE_DATA.zombie.blrWeapon;
    monster.blrInfo.init();
    monster.body.collideWorldBounds = true;
    this.setCreatureLabel(monster);

    // shadow
    var shadow = GAME.add.sprite(monster.x, monster.y, 'shadow');
    shadow.anchor.set(0.1);
    shadow.scale.setTo(0.7, 0.7);
    shadow.alpha = .3;
    monster.blrShadow = shadow;
    this.zombieShadowGroup.add(monster.blrShadow);

    // weapon
    var weapon = GAME.add.sprite(monster.x, monster.y, 'handsWeapon');
    weapon.anchor.set(0.5);
    weapon.animations.add('attack', [0, 1, 2, 3, 4]);
    weapon.animations.play('attack', 10, true, false);
    monster.blrWeapon = weapon;
    this.zombieWeaponGroup.add(monster.blrWeapon);

    // optional
  },

  spawnMachine: function() {
    // init
    var monster = this.spawnMonster(this.machineGroup, CREATURE_DATA.machine.phrInfo);
    monster.animations.add('blink', [0, 1, 0]);
    monster.blr = CREATURE_DATA.machine.blr;
    monster.blrInfo = CREATURE_DATA.machine.blrInfo;
    monster.blrLastPos = CREATURE_DATA.machine.blrLastPos;
    monster.blrLabel = CREATURE_DATA.machine.blrLabel;
    monster.blrShadow = CREATURE_DATA.machine.blrShadow;
    monster.blrWeapon = CREATURE_DATA.machine.blrWeapon;
    monster.blrInfo.init();
    monster.body.collideWorldBounds = true;
    this.setCreatureLabel(monster);

    // shadow
    var shadow = GAME.add.sprite(monster.x, monster.y, 'shadow');
    shadow.anchor.set(0.1);
    shadow.scale.setTo(0.7, 0.7);
    shadow.alpha = .3;
    monster.blrShadow = shadow;
    this.machineShadowGroup.add(monster.blrShadow);

    // weapon
    var weapon = GAME.add.sprite(monster.x, monster.y, 'laserTurretWeapon');
    weapon.anchor.set(0.5);
    weapon.animations.add('attack', [0, 1, 2]);
    weapon.animations.play('attack', 10, true, false);
    monster.blrWeapon = weapon;
    this.machineWeaponGroup.add(monster.blrWeapon);

    // bullet
    monster.blr.fireRate = 1000; // 1 fire/sec 
    monster.blr.nextFireTimestamp = 0;
    monster.blr.nBullets = 40;
    monster.blr.bulletSpeed = 500;

    var bulletGroup = GAME.add.group();
    bulletGroup.enableBody = true;
    bulletGroup.physicsBodyType = Phaser.Physics.ARCADE;
    bulletGroup.createMultiple(monster.blr.nBullets, 'laserBullet');
    bulletGroup.setAll('anchor.x', 0.5);
    bulletGroup.setAll('anchor.y', 0.5);
    bulletGroup.setAll('outOfBoundsKill', true);
    bulletGroup.setAll('checkWorldBounds', true);
    monster.bulletGroup = bulletGroup;

    // optional
  },

  /**
   * Spawn bat monster
   */
  spawnBat: function() {
    // init
    var monster = this.spawnMonster(this.batGroup, CREATURE_DATA.bat.phrInfo);
    monster.animations.add('blink', [0, 1, 0]);
    monster.blr = CREATURE_DATA.bat.blr;
    monster.blrInfo = CREATURE_DATA.bat.blrInfo;
    monster.blrLastPos = CREATURE_DATA.bat.blrLastPos;
    monster.blrLabel = CREATURE_DATA.bat.blrLabel;
    monster.blrShadow = CREATURE_DATA.bat.blrShadow;
    monster.blrWeapon = CREATURE_DATA.bat.blrWeapon;
    monster.blrInfo.init();
    monster.body.collideWorldBounds = true;
    this.setCreatureLabel(monster);

    // shadow
    var shadow = GAME.add.sprite(monster.x, monster.y, 'shadow');
    shadow.anchor.set(0.1);
    shadow.scale.setTo(0.5, 0.5);
    shadow.alpha = .3;
    monster.blrShadow = shadow;
    this.batShadowGroup.add(monster.blrShadow);

    // weapon
    var weapon = GAME.add.sprite(monster.x, monster.y, 'wingsWeapon');
    weapon.anchor.set(0.5);
    weapon.animations.add('attack', [0, 1, 2, 3]);
    weapon.animations.play('attack', 10, true, false);
    monster.blrWeapon = weapon;
    this.batWeaponGroup.add(monster.blrWeapon);

    // optional
    monster.scale.setTo(0.7, 0.7);
    monster.blrWeapon.scale.setTo(0.7, 0.7);
  },

  /**
   * Spawn monster
   * 
   * @param {Array.Group} monsterGroup - array of Phaser Group
   * @param {CreatureInfo} monsterData
   * @param {number}
   * @return {DisplayObject} Phaser DisplayObject
   */
  spawnMonster: function(monsterGroup, monsterData, startPosX, startPosY) {
    if (typeof startPosX === 'undefined') startPosX = UTIL.getRandomInt(0, GAME_WORLD_WIDTH);
    if (typeof startPosY === 'undefined') startPosY = UTIL.getRandomInt(0, GAME_WORLD_HEIGHT);
    var monsterSpriteName = monsterData.spriteName,
      monsterBodyOffset = monsterData.bodyOffset,
      monsterBodyWidth = monsterData.width,
      monsterBodyHeight = monsterData.height,
      monsterBodyWidthSize = monsterBodyWidth - monsterBodyOffset * 2,
      monsterBodyHeightSize = monsterBodyHeight - monsterBodyOffset * 2,
      monsterBodyMass = monsterData.bodyMass;

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
    // console.log('onCreatureOverlapWell - ' + creature.blrInfo.id + ' is on well');

    this.onCreatureIsRecovered(creature, 'well');
  },

  onCreatureIsRecovered: function(creature, recoveredFrom) {
    if (creature.blrInfo.life < creature.blrInfo.maxLife) {
      var ts = UTIL.getCurrentUtcTimestamp();

      if (ts > creature.blrInfo.lastRecoverTimestamp + creature.blrInfo.immortalDelay) {
        var logText = '+1 life (' + ++creature.blrInfo.life + ' > ' + creature.blrInfo.life + ') ' +
          creature.blrInfo.id + ' was recovered from ' + recoveredFrom;
        UI.addTextToLogList(logText);

        creature.blrInfo.updateLastRecoverTimestamp();
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
    // console.log('onCreatureOverlapFire - ' + creature.blrInfo.id + ' is on fire');

    this.onCreatureIsDamaged(creature, 'fire');
  },

  /**
   * @param {[type]} creature
   * @param {string} damageFrom - where is the damage come frome
   */
  onCreatureIsDamaged: function(creature, damageFrom) {
    var ts = UTIL.getCurrentUtcTimestamp();

    if (ts > creature.blrInfo.lastDamageTimestamp + creature.blrInfo.immortalDelay) {
      var logText = '-1 life (' + --creature.blrInfo.life + ' > ' + creature.blrInfo.life + ') ' + 
        creature.blrInfo.id + ' was damaged from ' + damageFrom;
      UI.addTextToLogList(logText);

      creature.blrInfo.updateLastDamageTimestamp();
      this.playDamageParticle(creature);
      creature.animations.play('blink', 10, false, false);

      // is die
      if (creature.blrInfo.life <= 0) {
        var logText = creature.blrInfo.id + ' was died by ' + damageFrom;
        UI.addTextToLogList(logText);

        creature.alive = false;
        creature.kill();
        creature.blrWeapon.kill();
        creature.blrShadow.kill();

      } else {
        this.updateCreatureLabelText(creature);
      }
    }
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
    console.log('playRecoverParticle');

    this.recoverEmitterGroup.x = creature.x;
    this.recoverEmitterGroup.y = creature.y;
    this.recoverEmitterGroup.start(true, 280, null, 20);
  },

  playDamageParticle: function(creature) {
    console.log('playDamageParticle');

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
    GAME.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    GAME.scale.pageAlignHorizontally = true;
    GAME.scale.pageAlignVertically = true;
    GAME.scale.setResizeCallback(function() {
      GAME.scale.setGameSize(window.innerWidth, window.innerHeight);
    });
  },

  init: function() {

    // floor
    this.floorGroup = GAME.add.group();
    this.stoneShadowGroup = GAME.add.group();
    this.stoneGroup = GAME.add.group();

    // item
    this.itemGroup = GAME.add.group();

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
    map.setTileIndexCallback(5, this.onCreatureOverlapWell, this);
    map.setTileIndexCallback(6, this.onCreatureOverlapFire, this);
    this.floorGroup = map.createLayer(0);
    this.floorGroup.resizeWorld();

    // map - stone (rock, bush)
    this.stoneGroup;
    this.stoneGroup = map.createLayer(1);
    map.setCollision([1, 3], true, this.stoneGroup);
    map.forEach(function(tile) {
      if (tile.index === 1 || tile.index === 3) {
        var stoneShadow = GAME.add.sprite(tile.worldX, tile.worldY, 'shadow');
        stoneShadow.scale.setTo(0.7, 0.7);
        stoneShadow.alpha = .3;
        this.stoneShadowGroup.add(stoneShadow);
      }
    }, this, 0, 0, 46, 46, this.stoneGroup);

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
    this.player.animations.add('blink', [0, 1, 0]);
    this.player.animations.add('recover', [0, 2, 0]);
    this.player.anchor.set(0.5);
    GAME.physics.enable(this.player);
    this.player.body.collideWorldBounds = true;
    this.player.body.setSize(playerBodySize, playerBodySize, playerOffset, playerOffset);
    this.player.body.tilePadding.set(playerOffset, playerOffset);
    this.player.body.maxAngular = 500;
    this.player.body.angularDrag = 50;
    this.player.phrInfo = CREATURE_DATA.hero.phrInfo;
    this.player.blr = CREATURE_DATA.hero.blr;
    this.player.blrInfo = CREATURE_DATA.hero.blrInfo;
    this.player.blrLastPos = CREATURE_DATA.hero.blrLastPos;
    this.player.blrLabel = CREATURE_DATA.hero.blrLabel;
    this.player.blrShadow = CREATURE_DATA.hero.blrShadow;
    this.player.blrWeapon = CREATURE_DATA.hero.blrWeapon;
    this.player.blrBullet = CREATURE_DATA.hero.blrBullet;

    this.player.blrInfo.init();
    this.setCreatureLabel(this.player);
    this.playerGroup.add(this.player);

    this.player.blrShadow = shadowTmp;
    this.playerShadowGroup.add(this.player.blrShadow);
    this.player.blrWeapon = weaponTmp;
    this.playerWeaponGroup.add(this.player.blrWeapon);

    // bullet
    this.player.blr.fireRate = 500; // 2 fire/sec 
    this.player.blr.nextFireTimestamp = 0;
    this.player.blr.nBullets = 40;
    this.player.blr.bulletSpeed = 500;

    var bulletGroup = GAME.add.group();
    bulletGroup.enableBody = true;
    bulletGroup.physicsBodyType = Phaser.Physics.ARCADE;
    bulletGroup.createMultiple(this.player.blr.nBullets, 'arrowBullet');
    bulletGroup.setAll('anchor.x', 0.5);
    bulletGroup.setAll('anchor.y', 0.5);
    bulletGroup.setAll('outOfBoundsKill', true);
    bulletGroup.setAll('checkWorldBounds', true);
    this.player.blrBullet = bulletGroup;
    this.playerArrowGroup.add(this.player.blrBullet);

    // map - tree
    this.treeGroup = map.createLayer(2);

    // camera
    GAME.camera.follow(this.player);

    // control
    this.cursors = GAME.input.keyboard.createCursorKeys();

    // reorder z-index (hack)
    GAME.world.bringToTop(this.floorGroup);
    GAME.world.bringToTop(this.stoneShadowGroup);
    GAME.world.bringToTop(this.stoneGroup);

    GAME.world.bringToTop(this.dashEmitterGroup);
    GAME.world.bringToTop(this.recoverEmitterGroup);
    GAME.world.bringToTop(this.damageEmitterGroup);

    GAME.world.bringToTop(this.itemGroup);

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
    console.log('onPlayerOverlapZombie');
  },

  onPlayerOverlapMachine: function(player, monster) {
    console.log('onPlayerOverlapMachine');
  },

  onPlayerOverlapBat: function(player, monster) {
    console.log('onPlayerOverlapBat');
  },

  onMachineLaserOverlapPlayer: function(laser, player) {
    console.log('onMachineLaserOverlapPlayer')
  },

  onPlayerArrowOverlapStone: function(arrow, stone) {
    console.log('onPlayerArrowOverlapStone');
  },

  onPlayerArrowOverlapMonster: function(arrow, monster) {
    console.log('onPlayerArrowOverlapMonster');
    
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

    // overlap - machine laser with player
    GAME.physics.arcade.overlap(this.machineLaserGroup, this.playerGroup, this.onMachineLaserOverlapPlayer, null, this);

    // overlap - player arrow with stoneGroup
    GAME.physics.arcade.overlap(this.playerArrowGroup, this.stoneGroup, this.onPlayerArrowOverlapStone, null, this);
    
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
          var newX = this.player.x,
            newY = this.player.y,
            newRotation = Math.atan2(
              GAME.input.y - (this.player.position.y - GAME.camera.y),
              GAME.input.x - (this.player.position.x - GAME.camera.x) 
            );
            
          this.player.rotation = newRotation;
          this.playDashParticle(this.player);
          this.updateCreatureWeapon(this.player);
          this.updateCreatureShadow(this.player);
        }
      }

      // input -  right
      if (GAME.input.activePointer.rightButton.isDown) {
        // fire arrow

        var ts = UTIL.getCurrentUtcTimestamp();
        if (ts > this.player.blr.nextFireTimestamp &&
          this.player.blrBullet.countDead() > 0) {
          
          // 2 bullet/sec (cause we have 7 frame per animation)
          this.player.blrWeapon.animations.play('attack', 14, false, false);
          this.player.blr.nextFireTimestamp = ts + this.player.blr.fireRate;

          var bullet = this.player.blrBullet.getFirstExists(false);
          bullet.reset(this.player.blrWeapon.x, this.player.blrWeapon.y);
          bullet.rotation = GAME.physics.arcade.moveToPointer(
            bullet,
            this.player.blr.bulletSpeed,
            GAME.input.activePointer
          );
        }
      }

      this.updateCreatureLastPosition(this.player);
    }

    // monster - zombie
    this.zombieGroup.forEachAlive(function(monster) {
      this.updateCreatureLastPosition(monster);
    }, this);

    // monster - machine
    this.machineGroup.forEachAlive(function(monster) {
      this.updateCreatureLastPosition(monster);

      if (GAME.physics.arcade.distanceBetween(monster, this.player) < monster.blr.visibleRange) {
        var ts = UTIL.getCurrentUtcTimestamp();

        if (ts > monster.nextFireTimestamp &&
          monster.bulletGroup.countDead() > 0) {

          monster.nextFireTimestamp = UTIL.getCurrentUtcTimestamp() + monster.fireRate; 
          var bullet = monster.blrBullet.getFirstDead();
          bullet.reset(monster.blrWeapon.x, monster.blrWeapon.y);
          bullet.rotation = GAME.physics.arcade.moveToObject(bullet, this.player, monster.bulletSpeed);
        }
      }
    }, this);

    // monster - bat
    this.batGroup.forEachAlive(function(monster) {
        this.updateCreatureLastPosition(monster);
    }, this);
  },

  isCreatureMove: function(creature) {
    return (creature.x !== creature.blrLastPos.x || creature.y !== creature.blrLastPos.y);  
  },

  isCreatureRotate: function(creature) {
    return (creature.rotation !== creature.blrLastPos.rotation);
  },

  updateCreatureShadow: function(creature, newX, newY) {
    if (typeof newX === 'undefined') newX = creature.x;
    if (typeof newY === 'undefined') newY = creature.y;

    if (creature.alive) {
      if (this.isCreatureMove(creature)) {
        creature.blrShadow.x = newX;
        creature.blrShadow.y = newY;
      }
    }
  },

  updateCreatureWeapon: function(creature, newX, newY, newRotation) {
    if (typeof newX === 'undefined') newX = creature.x;
    if (typeof newY === 'undefined') newY = creature.y;
    if (typeof newRotation === 'undefined') newRotation = creature.rotation;

    if (creature.alive) {
      if (this.isCreatureMove(creature)) {
        creature.blrWeapon.x = newX;
        creature.blrWeapon.y = newY;
      }

      creature.blrWeapon.rotation = newRotation;
    }
  },

  preRender: function() {
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
      GAME.debug.bodyInfo(this.player, 32, 32);
      GAME.debug.body(this.player);

      GAME.debug.spriteInfo(this.player, 32, 164);
      GAME.debug.spriteInfo(this.player.blrWeapon, 32, 264);

      this.zombieGroup.forEachAlive(function(monster) {
        GAME.debug.body(monster);
      }, this);

      // this.machineGroup.forEachAlive(function(monster) {
      //   GAME.debug.body(monster);
      // }, this);

      this.batGroup.forEachAlive(function(monster) {
        GAME.debug.body(monster);
      }, this);
    }
  }
};

module.exports = Play;
