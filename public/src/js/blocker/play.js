const GCONFIG = require('./config')
const MODULE = require('./../../../../common/module')
const GUTIL = require('./../../../../common/gutil')
const Position = MODULE.Position
const Hero = MODULE.Hero
const Zombie = MODULE.Zombie
const Machine = MODULE.Machine
const Bat = MODULE.Bat

function send (eventName, data) {
  SOCKET.emit(eventName, data)
}

let Play = function (GAME) {
  /** @type {boolean} flag for checking the client is ready to play */
  this.isGameReady = false

  /** @type {number} player angular speed */
  this.playerAngularVelocity = 200

  /** @type {number} last updating miniMap timestamp */
  this.lastMiniMapUpdatingTimestamp = 0

  /** @type {number} miniMap updating delay */
  this.miniMapUpdatingDelay = 500

  /** @type {number} enter key delay */
  this.enterKeyDelay = 200

  /** @type {number} bubble box delay */
  this.bubbleDelay = 3000

  /** @type {Object} virtual map, used for calculating */
  this.VTMap = {}

  /** @type {Phaser.Sprite} Phaser.Sprite that contain `Creature` object in `blr` property */
  this.player = {}

  // floor
  this.floorGroup = null
  this.vtmapDebugGroup = null
  this.stoneShadowGroup = null
  this.stoneGroup = null

  // monster
  this.monsterShadowGroup = null
  this.zombieWeaponGroup = null
  this.zombieGroup = null
  this.machineWeaponGroup = null
  this.machineGroup = null
  this.batWeaponGroup = null
  this.batGroup = null

  // hero
  this.heroShadowGroup = null
  this.enemyWeaponGroup = null
  this.enemyGroup = null
  this.playerWeaponGroup = null
  this.playerGroup = null

  // emitter
  this.dashEmitterGroup = null
  this.damageEmitterGroup = null
  this.recoverEmitterGroup = null

  // bullet
  this.machineLaserGroup = null
  this.enemyArrowGroup = null
  this.playerArrowGroup = null

  // sky
  this.treeGroup = null
  this.miniMapBg = null
  this.miniMapUnit = null
  this.heroBubbleGroup = null

  // input
  this.cursors = null
  this.spaceKey = null
  this.enterKey = null
}

Play.prototype = {

  /**
   * Get random started creature position
   * not be allowed at
   * - fire
   * - bush
   * - stone
   *
   * @returns {Position} return walkable position
   */
  getRandomWalkablePosition: function () {
    return this.getCreaturePositionByExclusion([1, 3, 6])
  },

  /**
   * Get random auto move monster position
   *
   * @param {Phaser.Sprite} monster - Phaser.Sprite that contain `Creature` object in `blr` property
   * @returns {Position} return walkable position
   */
  getRandomAutoMovePosition: function (monster) {
    let targetPos
    let isTooClose = true

    while (isTooClose) {
      targetPos = this.getRandomStartedCreaturePosition()

      const distance = GAME.physics.arcade.distanceToXY(
        monster,
        targetPos.x,
        targetPos.y
      )

      // if more than minimum distance
      if (distance > 600) {
        isTooClose = false
      }
    }

    return targetPos
  },

  /**
   * Update creature lastVector
   *
   * @param {Phaser.Sprite} creature - Phaser.Sprite that contain `Creature` object in `blr` property
   */
  updateCreatureLastVector: function (creature) {
    creature.blr.info.lastVector = {
      x: creature.x,
      y: creature.y,
      rotation: creature.rotation
    }
  },

  /**
   * get rotation between creature and mouse
   *
   * @param {Phaser.Sprite} creature - Phaser.Sprite that contain `Creature` object in `blr` property
   * @returns {number} rotation
   */
  getRotationBetweenCreatureAndMouse: function (creature) {
    var result = Math.atan2(
      GAME.input.y - (creature.position.y - GAME.camera.y),
      GAME.input.x - (creature.position.x - GAME.camera.x)
    )

    return result
  },

  /**
   * Update creature follow the mouse
   * So, this function will update
   * - body rotation
   *
   * @param {Phaser.Sprite} creature - Phaser.Sprite that contain `Creature` object in `blr` property
   */
  updateCreatureRotationByFollowingMouse: function (creature) {
    const newRotation = this.getRotationBetweenCreatureAndMouse(creature)
    creature.rotation = newRotation
  },

  /**
   * Check is creature move
   *
   * @param {Phaser.Sprite} creature - Phaser.Sprite that contain `Creature` object in `blr` property
   */
  isCreatureMove: function (creature) {
    return (creature.x !== creature.blr.info.lastVector.x || creature.y !== creature.blr.info.lastVector.y)
  },

  /**
   * Check is creature rotate
   *
   * @param {Phaser.Sprite} creature - Phaser.Sprite that contain `Creature` object in `blr` property
   */
  isCreatureRotate: function (creature) {
    return (creature.rotation !== creature.blr.info.lastVector.rotation)
  },

  /**
   * Update creature shadow
   * using creature position by default
   *
   * @param {Phaser.Sprite} creature - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {number} [newX]
   * @param {number} [newY]
   */
  updateCreatureShadow: function (creature, newX, newY) {
    if (typeof newX === 'undefined') newX = creature.x
    if (typeof newY === 'undefined') newY = creature.y

    creature.blr.shadow.x = newX
    creature.blr.shadow.y = newY
  },

  /**
   * Update creature weapon
   * using creature position by default
   *
   * @param {Phaser.Sprite} creature - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {number} [newX]
   * @param {number} [newY]
   * @param {number} [newRotation]
   */
  updateCreatureWeapon: function (creature, newX, newY, newRotation) {
    if (typeof newX === 'undefined') newX = creature.x
    if (typeof newY === 'undefined') newY = creature.y
    if (typeof newRotation === 'undefined') newRotation = creature.rotation

    creature.blr.weapon.x = newX
    creature.blr.weapon.y = newY
    creature.blr.weapon.rotation = newRotation
  },

  /**
   * Get enemy object by playerId
   * implemented "break" hack
   *
   * @see http://stackoverflow.com/questions/2641347/how-to-short-circuit-array-foreach-like-calling-break
   *
   * @param {string} playerId
   * @returns {Phaser.Sprite} Phaser.Sprite that contain `Creature` object in `blr` property
   */
  getEnemyByPlayerId: function (playerId) {
    let isFound = false
    let result = {}
    const BreakException = {}

    try {
      this.enemyGroup.forEach(function (hero) {
        if (hero.blr.info.id === playerId) {
          isFound = true
          result = hero
          throw BreakException
        }
      }, this)
    } catch (e) {
      if (e !== BreakException) throw e
    }

    if (!isFound) {
      UTIL.clientBugLog('getEnemyByPlayerId', 'Not found playerId', playerId)
    }

    return result
  },

  /**
   * Get monster object by monsterId and monsterGroup
   * based on `getEnemyByPlayerId`
   *
   * @param {string} monsterId
   * @param {Phaser.Group} monsterGroup
   * @returns {Phaser.Sprite} Phaser.Sprite that contain `Creature` object in `blr` property
   */
  getMonsterByMonsterIdAndGroup: function (monsterId, monsterGroup) {
    let isFound = false
    let result = {}
    const BreakException = {}

    try {
      monsterGroup.forEach(function (monster) {
        if (monster.blr.info.id === monsterId) {
          isFound = true
          result = monster
          throw BreakException
        }
      }, this)
    } catch (e) {
      if (e !== BreakException) throw e
    }

    if (!isFound) {
      UTIL.clientBugLog('getMonsterByMonsterIdAndGroup', 'Not found monsterId', monsterId)
    }

    return result
  },

  /**
   * Check the creature is a player or not
   * by using creatureId
   *
   * @param {string} creatureId
   * @returns {boolean}
   */
  isPlayer: function (creatureId) {
    return (this.player.blr.info.id === creatureId)
  },

  /**
   * Get nearest hero
   * default: player
   *
   * @param {Position|Vector} position
   * @returns {Phaser.Sprite} Phaser.Sprite that contain `Creature` object in `blr` property
   */
  getNearestHero: function (position) {
    let nearestHero = this.player
    let nearestDistance = UTIL.getDistanceBetween(position, this.player.blr.info.lastVector)

    this.enemyGroup.forEachAlive(function (hero) {
      var distance = UTIL.getDistanceBetween(position, hero.blr.info.lastVector)

      if (distance < nearestDistance) {
        nearestHero = hero
        nearestDistance = distance
      }
    }, this)

    return nearestHero
  },

  /* ================================================================ Log
   */

  /**
   * Log creature respawning into log list
   *
   * @param {Phaser.Sprite} creature - Phaser.Sprite that contain `Creature` object in `blr` property
   */
  logCreatureRespawning: function (creature) {
    var logText = creature.blr.info.type + ' ' + creature.blr.info.id +
      ' (' + creature.blr.info.life + ') is respawn at ' + creature.x + ', ' + creature.y
    UI.addTextToLogList(logText)
  },

  /**
   * Log creature message into log list
   *
   * @param {Phaser.Sprite} creature - Phaser.Sprite that contain `Creature` object in `blr` property
   */
  logCreatureMessage: function (creature) {
    var logText = creature.blr.info.type + ' ' + creature.blr.info.id +
      ': ' + creature.blr.info.lastMessage
    UI.addTextToLogList(logText)
  },

  /**
   * Log on player connect
   *
   * @param {CreatureInfo} playerInfo
   */
  logOnPlayerConnect: function (playerInfo) {
    var logText = 'hero ' + playerInfo.id + ' connect'
    UI.addTextToLogList(logText)
  },

  /**
   * Log on player disconnect
   *
   * @param {CreatureInfo} playerInfo
   */
  logOnPlayerDisconnect: function (playerInfo) {
    var logText = 'hero ' + playerInfo.id + ' disconnect'
    UI.addTextToLogList(logText)
  },

  /**
   * Log on creature is recovered
   *
   * @param {Phaser.Sprite} creature - creature that contain `Creature` object in `blr` property
   * @param {string} recoveredFrom - where is the recover come frome
   */
  logOnCreatureIsRecovered: function (creature, recoveredFrom) {
    var logText = '+1 life ' + creature.blr.info.type + ' ' + creature.blr.info.id +
      ' (' + creature.blr.info.life + ')  was recovered from ' + recoveredFrom

    UI.addTextToLogList(logText)
  },

  /**
   * Log on creature is damaged
   *
   * @param {Phaser.Sprite} creature - creature that contain `Creature` object in `blr` property
   * @param {string} damageFrom - where is the damage come frome
   */
  logOnCreatureIsDamaged: function (creature, damageFrom) {
    var logText = '-1 life ' + creature.blr.info.type + ' ' + creature.blr.info.id +
      ' (' + creature.blr.info.life + ')  was damaged from ' + damageFrom

    UI.addTextToLogList(logText)
  },

  /**
   * Log on creature is died
   *
   * @param {Phaser.Sprite} creature - creature that contain `Creature` object in `blr` property
   * @param {string} damageFrom - where is the damage come frome
   */
  logOnCreatureIsDied: function (creature, damageFrom) {
    var logText = creature.blr.info.type + ' ' + creature.blr.info.id + ' was died by ' + damageFrom

    UI.addTextToLogList(logText)
  },

  /* ================================================================ Bubble
   */

  /**
   * Set Hero Bubble (contain message)
   *
   * @param {Phaser.Sprite} creature - creature that contain `Creature` object in `blr` property
   */
  setHeroBubble: function (creature) {
    const bubbleStyle = {
      font: '12px ' + GCONFIG.mainFontFamily,
      fill: '#000',
      backgroundColor: '#ffffff',
      align: 'center'
    }
    let bubble = GAME.add.text(0, 0, '', bubbleStyle)

    bubble.anchor.set(0.5, 2.4)
    bubble.padding.set(0)
    bubble.visible = false

    creature.blr.bubble = bubble
    this.heroBubbleGroup.add(creature.blr.bubble)
    this.updateCreatureBubble(creature)
  },

  /**
   * Update creature bubble
   * - text
   * - position
   *
   * @param {Phaser.Sprite} creature - creature that contain `Creature` object in `blr` property
   */
  updateCreatureBubble: function (creature) {
    if (creature.blr.bubble.visible && creature.blr.info.lastMessage) {
      this.updateCreatureBubbleText(creature)
      this.updateCreatureBubblePosition(creature)
    }
  },

  /**
   * Update creature bubble text
   *
   * @param {Phaser.Sprite} creature - creature that contain `Creature` object in `blr` property
   */
  updateCreatureBubbleText: function (creature) {
    const bubbletext = creature.blr.info.lastMessage

    creature.blr.bubble.setText(bubbletext)
  },

  /**
   * Update creature bubble position
   *
   * @param {Phaser.Sprite} creature - creature that contain `Creature` object in `blr` property
   */
  updateCreatureBubblePosition: function (creature) {
    creature.blr.bubble.x = creature.x
    creature.blr.bubble.y = creature.y
  },

  /**
   * Hide creature bubble when time pass
   *
   * @param {Phaser.Sprite} creature - creature that contain `Creature` object in `blr` property
   */
  updateCreatureBubbleVisibility: function (creature) {
    const ts = UTIL.getCurrentUtcTimestamp()

    if (ts - creature.blr.info.lastMessageTimestamp > this.bubbleDelay) {
      creature.blr.bubble.visible = false
    }
  },

  /* ================================================================ Label
   */

  /**
   * Set creature label (child)
   *
   * @param {Phaser.Sprite} creature - creature that contain `Creature` object in `blr` property
   */
  setCreatureLabel: function (creature) {
    const labelStyle = {
      font: '13px ' + GCONFIG.mainFontFamily,
      fill: '#fff',
      align: 'left'
    }
    const label = GAME.add.text(0, 0, '', labelStyle)

    creature.addChild(label)
    creature.blr.label = label
    this.updateCreatureLabel(creature)
  },

  /**
   * Update creature label (child)
   * - text
   * - position
   *
   * @param {Phaser.Sprite} creature - creature that contain `Creature` object in `blr` property
   */
  updateCreatureLabel: function (creature) {
    this.updateCreatureLabelText(creature)

    // update label position only 1 time
    // cause we using `child`
    this.updateCreatureLabelPosition(creature)
  },

  /**
   * Update creature label text
   *
   * @param {Phaser.Sprite} creature - creature that contain `Creature` object in `blr` property
   */
  updateCreatureLabelText: function (creature) {
    const labeltext = creature.blr.info.id + ' ' + creature.blr.info.life + '/' + creature.blr.info.maxLife
    creature.blr.label.setText(labeltext)
  },

  /**
   * Update creature label position
   *
   * @param {Phaser.Sprite} creature - creature that contain `Creature` object in `blr` property
   */
  updateCreatureLabelPosition: function (creature) {
    const labelLeftOffset = 0
    const labelTopOffset = -10

    creature.blr.label.x = -(creature.blr.label.width / 2) - labelLeftOffset
    creature.blr.label.y = -(creature.height / 2) - (creature.blr.label.height / 2) + labelTopOffset
  },

  /* ================================================================ Spawn
   */

  /**
   * Spawn zombie
   *
   * @param {CreatureInfo} creatureInfo
   */
  spawnZombie: function (creatureInfo) {
    // init
    const monsterBlr = new Zombie(creatureInfo)
    let monster = this.spawnMonster(this.zombieGroup, monsterBlr)

    // animation
    monster.animations.add('blink', [0, 1, 0])

    // weapon
    const weapon = GAME.add.sprite(monster.x, monster.y, 'handsWeapon')
    weapon.anchor.set(0.5)
    weapon.animations.add('attack', [0, 1, 2, 3, 4])
    weapon.animations.play('attack', 10, true, false)
    GAME.physics.enable(weapon)
    monster.blr.weapon = weapon
    this.zombieWeaponGroup.add(monster.blr.weapon)

    // optional
    monster.body.moves = false
  },

  /**
   * Spawn machine
   *
   * @param {CreatureInfo} creatureInfo
   */
  spawnMachine: function (creatureInfo) {
    // init
    const monsterBlr = new Machine(creatureInfo)
    let monster = this.spawnMonster(this.machineGroup, monsterBlr)

    // animation
    monster.animations.add('blink', [0, 1, 0])

    // weapon
    const weapon = GAME.add.sprite(monster.x, monster.y, 'laserTurretWeapon')
    weapon.anchor.set(0.5)
    weapon.animations.add('attack', [0, 1, 2])
    weapon.animations.play('attack', 10, true, false)
    GAME.physics.enable(weapon)
    monster.blr.weapon = weapon
    this.machineWeaponGroup.add(monster.blr.weapon)

    // bullet
    let bulletGroup = GAME.add.group()
    bulletGroup.enableBody = true
    bulletGroup.physicsBodyType = Phaser.Physics.ARCADE
    bulletGroup.createMultiple(monster.blr.misc.nBullets, 'laserBullet')
    bulletGroup.setAll('anchor.x', 0.5)
    bulletGroup.setAll('anchor.y', 0.5)
    bulletGroup.setAll('outOfBoundsKill', true)
    bulletGroup.setAll('checkWorldBounds', true)
    monster.blr.bullet = bulletGroup
    this.machineLaserGroup.add(monster.blr.bullet)

    // optional
    monster.body.moves = false
  },

  /**
   * Spawn bat
   *
   * @param {CreatureInfo} creatureInfo
   */
  spawnBat: function (creatureInfo) {
    // init
    const monsterBlr = new Bat(creatureInfo)
    let monster = this.spawnMonster(this.batGroup, monsterBlr)

    // animation
    monster.animations.add('blink', [0, 1, 0])

    // weapon
    const weapon = GAME.add.sprite(monster.x, monster.y, 'wingsWeapon')
    weapon.anchor.set(0.5)
    weapon.animations.add('attack', [0, 1, 2, 3])
    weapon.animations.play('attack', 10, true, false)
    GAME.physics.enable(weapon)
    monster.blr.weapon = weapon
    this.batWeaponGroup.add(monster.blr.weapon)

    // optional
    monster.body.moves = false
    monster.scale.setTo(0.7, 0.7)
    monster.blr.shadow.scale.setTo(0.5, 0.5)
    monster.blr.weapon.scale.setTo(0.7, 0.7)
  },

  /**
   * Spawn monster
   *
   * @param {Phaser.Group} monsterGroup
   * @param {CreatureInfo} monsterBlr
   *
   * @return {DisplayObject} Phaser DisplayObject
   */
  spawnMonster: function (monsterGroup, monsterBlr) {
    const monsterPhrInfo = monsterBlr.phrInfo
    const startVector = monsterBlr.info.startVector

    const monsterSpriteName = monsterPhrInfo.spriteName
    const monsterBodyOffset = monsterPhrInfo.bodyOffset
    const monsterBodyWidth = monsterPhrInfo.width
    const monsterBodyHeight = monsterPhrInfo.height
    const monsterBodyWidthSize = monsterBodyWidth - monsterBodyOffset * 2
    const monsterBodyHeightSize = monsterBodyHeight - monsterBodyOffset * 2
    const monsterBodyMass = monsterPhrInfo.bodyMass

    // sprite
    let monster = monsterGroup.create(startVector.x, startVector.y, monsterSpriteName)
    GAME.physics.enable(monster)
    monster.anchor.set(0.5)

    // body
    monster.body.setSize(
      monsterBodyWidthSize,
      monsterBodyHeightSize,
      monsterBodyOffset,
      monsterBodyOffset
    )
    monster.body.tilePadding.set(monsterBodyOffset, monsterBodyOffset)
    monster.body.mass = monsterBodyMass
    monster.body.rotation = startVector.rotation
    monster.body.collideWorldBounds = true

    // blr
    monster.blr = monsterBlr

    // shadow
    let shadow = GAME.add.sprite(monster.x, monster.y, 'shadow')
    shadow.anchor.set(0.1)
    shadow.scale.setTo(0.7, 0.7)
    shadow.alpha = 0.3
    monster.blr.shadow = shadow
    this.monsterShadowGroup.add(monster.blr.shadow)

    // label
    this.setCreatureLabel(monster)

    // misc
    this.logCreatureRespawning(monster)
    UI.addCreatureIdToCreatureList(monster.blr.info.id, 'monster')

    return monster
  },

  /**
   * Spawn player
   *
   * @param {CreatureInfo} playerInfo
   */
  spawnPlayer: function (playerInfo) {
    let heroBlr = new Hero(playerInfo)

    this.player = this.spawnHero(heroBlr, heroBlr.info.lastVector)
    this.playerGroup.add(this.player)
    this.playerWeaponGroup.add(this.player.blr.weapon)
    this.playerArrowGroup.add(this.player.blr.bullet)

    UI.addCreatureIdToCreatureList(this.player.blr.info.id, 'player')
  },

  /**
   * Spawn enemy
   *
   * @param {CreatureInfo} playerInfo
   */
  spawnEnemy: function (playerInfo) {
    let heroBlr = new Hero(playerInfo)

    // same as `spawnPlayer`
    let enemy = this.spawnHero(heroBlr, heroBlr.info.lastVector)
    this.enemyGroup.add(enemy)
    this.enemyWeaponGroup.add(enemy.blr.weapon)
    this.enemyArrowGroup.add(enemy.blr.bullet)

    UI.addCreatureIdToCreatureList(enemy.blr.info.id, 'enemy')

    // optional
    enemy.body.moves = false
  },

  /**
   * Spawn hero
   *
   * @param {CreatureInfo} heroBlr
   * @param {Vector} [currentVector]
   */
  spawnHero: function (heroBlr, currentVector) {
    if (typeof currentVector === 'undefined') currentVector = heroBlr.info.startVector
    const bodyMass = heroBlr.phrInfo.bodyMass
    const bodyOffset = 8
    const bodySize = 46 - bodyOffset * 2

    // init & sprite
    let hero = GAME.add.sprite(currentVector.x, currentVector.y, 'hero')
    hero.rotation = currentVector.rotation
    hero.blr = heroBlr
    hero.anchor.set(0.5)

    // body
    GAME.physics.enable(hero)
    hero.body.collideWorldBounds = true
    hero.body.setSize(bodySize, bodySize, bodyOffset, bodyOffset)
    hero.body.tilePadding.set(bodyOffset, bodyOffset)
    hero.body.mass = bodyMass
    hero.body.maxAngular = 500
    hero.body.angularDrag = 50

    // shadow
    var shadowTmp = GAME.add.sprite(currentVector.x, currentVector.y, 'shadow')
    shadowTmp.anchor.set(0.1)
    shadowTmp.scale.setTo(0.7, 0.7)
    shadowTmp.alpha = 0.3
    hero.blr.shadow = shadowTmp
    this.heroShadowGroup.add(hero.blr.shadow)

    // weapon
    var weaponTmp = GAME.add.sprite(currentVector.x, currentVector.y, 'bowWeapon')
    weaponTmp.rotation = currentVector.rotation
    weaponTmp.animations.add('attack', [0, 1, 2, 3, 4, 5, 0])
    weaponTmp.anchor.set(0.3, 0.5)
    weaponTmp.scale.setTo(0.5)
    hero.blr.weapon = weaponTmp

    // animation
    hero.animations.add('blink', [0, 1, 0])
    hero.animations.add('recover', [0, 2, 0])

    // bullet
    var bulletGroup = GAME.add.group()
    bulletGroup.enableBody = true
    bulletGroup.physicsBodyType = Phaser.Physics.ARCADE
    bulletGroup.createMultiple(hero.blr.misc.nBullets, 'arrowBullet')
    bulletGroup.setAll('anchor.x', 0.5)
    bulletGroup.setAll('anchor.y', 0.5)
    bulletGroup.setAll('outOfBoundsKill', true)
    bulletGroup.setAll('checkWorldBounds', true)
    hero.blr.bullet = bulletGroup

    // label
    this.setCreatureLabel(hero)

    // bubble
    this.setHeroBubble(hero)

    // misc
    this.logCreatureRespawning(hero)

    return hero
  },

  /**
   * Respawn monster
   * base on `respawnHero`
   *
   * @param {Phaser.Sprite} monster - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {CreatureInfo} monsterInfo
   */
  respawnMonster: function (monster, monsterInfo) {
    // revive
    monster.blr.label.revive()
    monster.blr.shadow.revive()
    monster.blr.weapon.revive()
    // monster.blr.bubble.revive();
    // monster.blr.bullet.revive();
    monster.revive()

    // set position
    monster.blr.info = monsterInfo
    monster.x = monsterInfo.startVector.x
    monster.y = monsterInfo.startVector.y
    monster.rotation = monsterInfo.startVector.rotation

    // set position - sub
    this.updateCreatureWeapon(monster)
    this.updateCreatureShadow(monster)
    this.updateCreatureBubblePosition(monster)

    // misc
    monster.blr.reset()
    this.logCreatureRespawning(monster)
  },

  /**
   * Respawn hero
   *
   * @param {Phaser.Sprite} hero - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {CreatureInfo} playerInfo
   */
  respawnHero: function (hero, playerInfo) {
    // revive
    hero.blr.label.revive()
    hero.blr.shadow.revive()
    hero.blr.weapon.revive()
    hero.blr.bubble.revive()
    // hero.blr.bullet.revive();
    hero.revive()

    // set position
    hero.blr.info = playerInfo
    hero.x = playerInfo.startVector.x
    hero.y = playerInfo.startVector.y
    hero.rotation = playerInfo.startVector.rotation

    // set position - sub
    this.updateCreatureWeapon(hero)
    this.updateCreatureShadow(hero)
    this.updateCreatureBubblePosition(hero)

    // misc
    hero.blr.reset()
    this.logCreatureRespawning(hero)
  },

  /* ================================================================ Map
   */

  /**
   * Render yello square in a tile that is not walkable
   */
  debugMap: function () {
    const renderPadding = 4
    const mapData = this.VTMap.data
    const mapTileWidth = this.VTMap.mapTileWidth
    const mapTileHeight = this.VTMap.mapTileHeight
    const nTileWidth = this.VTMap.nTileWidth
    const nTileHeight = this.VTMap.nTileHeight

    const bmdWidth = mapTileWidth - renderPadding * 2
    const bmdHeight = mapTileHeight - renderPadding * 2

    var bmd = GAME.add.bitmapData(bmdWidth, bmdHeight)
    bmd.ctx.beginPath()
    bmd.ctx.rect(0, 0, bmdWidth, bmdHeight)
    bmd.ctx.fillStyle = 'rgba(240, 240, 100, .6)'
    bmd.ctx.fill()

    for (let i = 0; i < nTileWidth; i++) {
      for (let j = 0; j < nTileHeight; j++) {
        var mapPoint = mapData[i][j]

        // walkable
        if (mapPoint !== 0) {
          const x = (j * mapTileHeight) + renderPadding
          const y = (i * mapTileWidth) + renderPadding
          const drawnObject = GAME.add.sprite(x, y, bmd)

          this.vtmapDebugGroup.add(drawnObject)
        }
      }
    }
  },

  /**
   * Set miniMap (background)
   * - floorGroup
   * - stoneGroup
   */
  setMiniMap: function () {
    // tile size must be square
    const miniMapSize = 5
    let miniMapBgBmd = GAME.add.bitmapData(
      miniMapSize * this.VTMap.nTileWidth,
      miniMapSize * this.VTMap.nTileHeight
    )
    let miniMapBgSpr

    // row
    for (let i = 0; i < this.VTMap.nTileHeight; i++) {
      // column
      for (let j = 0; j < this.VTMap.nTileWidth; j++) {
        const mapData = this.VTMap.data[i][j]
        // @todo should be in config file
        let color = '#36a941'
        const miniMapX = j * miniMapSize
        const miniMapY = i * miniMapSize

        switch (mapData) {
          // brush
          case 1:
            color = '#4ed469'
            break
            // stone
          case 3:
            color = '#b4baaf'
            break
            // well
          case 5:
            color = '#409fff'
            break
            // fire
          case 6:
            color = '#f07373'
            break
        }

        miniMapBgBmd.ctx.fillStyle = color
        // actually, param 3 and 4 should be 5 (equal to miniMapSize)
        // but I want some kind of padding between each tile
        // so, it should be 4 instead
        miniMapBgBmd.ctx.fillRect(miniMapX, miniMapY, 4, 4)
      }
    }

    miniMapBgSpr = GAME.add.sprite(6, 6, miniMapBgBmd)
    miniMapBgSpr.alpha = 0.6
    miniMapBgSpr.fixedToCamera = true
    this.miniMapBg.add(miniMapBgSpr)
  },

  /**
   * Update unit (in miniMap)
   * - hero (player / enemy)
   * - monster (zombie / machine / bat)
   */
  updateMinimap: function () {
    const ts = UTIL.getCurrentUtcTimestamp()

    if (ts - this.lastMiniMapUpdatingTimestamp > this.miniMapUpdatingDelay) {
      // tile size must be square
      const miniMapSize = 5
      let miniMapUnitBmd = GAME.add.bitmapData(
        miniMapSize * this.VTMap.nTileWidth,
        miniMapSize * this.VTMap.nTileHeight
      )
      let miniMapUnitSpr

      // destroy
      this.miniMapUnit.forEachAlive(function (unitSpr) {
        unitSpr.destroy()
      })

      // create new one
      miniMapUnitBmd = this.addCreatureGroupToMiniMapUnitBmd(miniMapUnitBmd, this.playerGroup, '#fff')
      miniMapUnitBmd = this.addCreatureGroupToMiniMapUnitBmd(miniMapUnitBmd, this.enemyGroup, '#60f0ff')
      miniMapUnitBmd = this.addCreatureGroupToMiniMapUnitBmd(miniMapUnitBmd, this.zombieGroup, '#776b9f')
      miniMapUnitBmd = this.addCreatureGroupToMiniMapUnitBmd(miniMapUnitBmd, this.machineGroup, '#776b9f')
      miniMapUnitBmd = this.addCreatureGroupToMiniMapUnitBmd(miniMapUnitBmd, this.batGroup, '#776b9f')

      // create sprite and add to group
      miniMapUnitSpr = GAME.add.sprite(6, 6, miniMapUnitBmd)
      miniMapUnitSpr.fixedToCamera = true
      this.miniMapUnit.add(miniMapUnitSpr)

      // update timestamp
      this.lastMiniMapUpdatingTimestamp = ts
    }
  },

  /**
   * Add creature into `BitmapData` then return it
   *
   * @param {Phaser.BitmapData} miniMapUnitBmd
   * @param {Phaser.Group} creatureGroup
   * @param {string} colorCode
   * @returns {Phaser.BitmapData}
   */
  addCreatureGroupToMiniMapUnitBmd: function (miniMapUnitBmd, creatureGroup, colorCode) {
    const miniMapSize = 5

    creatureGroup.forEachAlive(function (creature) {
      const x = creature.x
      const y = creature.y
      const tileIndex = GUTIL.convertPointToTileIndex(x, y)
      const miniMapX = tileIndex.x * miniMapSize
      const miniMapY = tileIndex.y * miniMapSize

      miniMapUnitBmd.ctx.fillStyle = colorCode
      // actually, it should be the same as `setMiniMap`
      // but I want to add more padding
      miniMapUnitBmd.ctx.fillRect(miniMapX + 1, miniMapY + 1, 2, 2)
    })

    return miniMapUnitBmd
  },

  /* ================================================================ Emitter
   */

  /**
   * Set dash emiiter
   */
  setDashEmitter: function () {
    const nEmitter = 60

    this.dashEmitterGroup = GAME.add.emitter(0, 0, nEmitter)
    this.dashEmitterGroup.makeParticles('dashParticle')
    this.dashEmitterGroup.gravity = 0
    this.dashEmitterGroup.minRotation = 0
    this.dashEmitterGroup.maxRotation = 0
    this.dashEmitterGroup.minParticleSpeed.setTo(-40, -40)
    this.dashEmitterGroup.maxParticleSpeed.setTo(40, 40)
    this.dashEmitterGroup.bounce.setTo(0.5, 0.5)
  },

  /**
   * Set recover emiiter
   */
  setRecoverEmitter: function () {
    const nEmitter = 30

    this.recoverEmitterGroup = GAME.add.emitter(0, 0, nEmitter)
    this.recoverEmitterGroup.makeParticles('recoverParticle')
    this.recoverEmitterGroup.gravity = 0
    this.recoverEmitterGroup.minParticleSpeed.setTo(-200, -200)
    this.recoverEmitterGroup.maxParticleSpeed.setTo(200, 200)
  },

  /**
   * Set damage emiiter
   */
  setDamageEmitter: function () {
    const nEmitter = 30

    this.damageEmitterGroup = GAME.add.emitter(0, 0, nEmitter)
    this.damageEmitterGroup.makeParticles('damageParticle')
    this.damageEmitterGroup.gravity = 0
    this.damageEmitterGroup.minParticleSpeed.setTo(-200, -200)
    this.damageEmitterGroup.maxParticleSpeed.setTo(200, 200)
  },

  /**
   * Play dash particle
   */
  playDashParticle: function (creature) {
    this.dashEmitterGroup.x = creature.x
    this.dashEmitterGroup.y = creature.y
    this.dashEmitterGroup.start(true, 280, null, 20)
  },

  /**
   * Play recover particle
   */
  playRecoverParticle: function (creature) {
    this.recoverEmitterGroup.x = creature.x
    this.recoverEmitterGroup.y = creature.y
    this.recoverEmitterGroup.start(true, 280, null, 20)
  },

  /**
   * Play damage particle
   */
  playDamageParticle: function (creature) {
    this.damageEmitterGroup.x = creature.x
    this.damageEmitterGroup.y = creature.y
    this.damageEmitterGroup.start(true, 280, null, 20)
  },

  /**
   * Fade dash emiiter
   */
  fadeDashEmitter: function () {
    this.dashEmitterGroup.forEachAlive(function (particle) {
      particle.alpha = GAME.math.clamp(particle.lifespan / 100, 0, 1)
    }, this)
  },

  /**
   * Fade recover emiiter
   */
  fadeRecoverEmitter: function () {
    this.recoverEmitterGroup.forEachAlive(function (particle) {
      particle.alpha = GAME.math.clamp(particle.lifespan / 100, 0, 1)
    }, this)
  },

  /**
   * Fade damage emiiter
   */
  fadeDamageEmitter: function () {
    this.damageEmitterGroup.forEachAlive(function (particle) {
      particle.alpha = GAME.math.clamp(particle.lifespan / 100, 0, 1)
    }, this)
  },

  /**
   * Fade all emiiters
   */
  fadeAllEmitters: function () {
    this.fadeDashEmitter()
    this.fadeRecoverEmitter()
    this.fadeDamageEmitter()
  },

  /* ================================================================ Overlap
   */

  /**
   * Callback event when hit well
   *
   * @param {Phaser.Sprite} creature - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {[type]} tile
   */
  onCreatureOverlapWell: function (creature, tile) {
    this.onCreatureIsRecovered(creature, 'well')
  },

  /**
   * Callback event when hit fire
   *
   * @param {Phaser.Sprite} creature - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {[type]} tile
   */
  onCreatureOverlapFire: function (creature, tile) {
    this.onCreatureIsDamaged(creature, 'fire')
  },

  onPlayerOverlapZombie: function (player, monster) {

  },

  onPlayerOverlapMachine: function (player, monster) {

  },

  onPlayerOverlapBat: function (player, monster) {

  },

  /**
   * Callback event when player overlap zombie weapon
   *
   * @param {Phaser.Sprite} player - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {Phaser.Sprite} monsterWeapon
   */
  onPlayerOverlapZombieWeapon: function (player, monsterWeapon) {
    this.onCreatureIsDamaged(player, 'zombie hands')
  },

  /**
   * Callback event when player overlap machine weapon
   *
   * @param {Phaser.Sprite} player - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {Phaser.Sprite} monsterWeapon
   */
  onPlayerOverlapMachineWeapon: function (player, monsterWeapon) {
    this.onCreatureIsDamaged(player, 'machine\'s turret')
  },

  /**
   * Callback event when player overlap bat weapon
   *
   * @param {Phaser.Sprite} player - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {Phaser.Sprite} monsterWeapon
   */
  onPlayerOverlapBatWeapon: function (player, monsterWeapon) {
    this.onCreatureIsDamaged(player, 'bat wings')
  },

  /**
   * Callback event when machine laser overlap player
   *
   * @param {[type]} laser
   * @param {Phaser.Sprite} hero - Phaser.Sprite that contain `Creature` object in `blr` property
   */
  onMachineLaserOverlapPlayer: function (laser, hero) {
    laser.kill()

    this.onCreatureIsDamaged(hero, 'laser')
  },

  /**
   * Callback event when machine laser overlap enable
   *
   * @param {[type]} laser
   * @param {Phaser.Sprite} hero - Phaser.Sprite that contain `Creature` object in `blr` property
   */
  onMachineLaserOverlapEnemy: function (laser, hero) {
    // just for clear `enemy` event
    // same as `onMachineLaserOverlapPlayer`
    laser.kill()
  },

  onPlayerArrowOverlapStoneGroup: function (arrow, stone) {

  },

  /**
   * Callback event when player arrow overlap monster
   *
   * @param {[type]} arrow
   * @param {Phaser.Sprite} monster - Phaser.Sprite that contain `Creature` object in `blr` property
   */
  onPlayerArrowOverlapMonster: function (arrow, monster) {
    arrow.kill()

    this.onCreatureIsDamaged(monster, 'arrow')
  },

  /**
   * Callback event when enemy arrow overlap monster
   *
   * @param {[type]} arrow
   * @param {Phaser.Sprite} monster - Phaser.Sprite that contain `Creature` object in `blr` property
   */
  onEnemyArrowOverlapMonster: function (arrow, monster) {
    // just for clear `enemy` event
    // same as `onPlayerArrowOverlapMonster`
    arrow.kill()
  },

  /**
   * Callback event when player arrow overlap enemy
   *
   * @param {[type]} arrow
   * @param {Phaser.Sprite} hero - Phaser.Sprite that contain `Creature` object in `blr` property
   */
  onPlayerArrowOverlapEnemy: function (arrow, hero) {
    arrow.kill()

    this.onCreatureIsDamaged(hero, 'arrow')
  },

  /**
   * Callback event when player arrow overlap player
   *
   * @param {[type]} arrow
   * @param {Phaser.Sprite} hero - Phaser.Sprite that contain `Creature` object in `blr` property
   */
  onPlayerArrowOverlapPlayer: function (arrow, hero) {
    // just in case
    arrow.kill()
  },

  /**
   * Callback event when enemy arrow overlap player
   *
   * @param {[type]} arrow
   * @param {Phaser.Sprite} hero - Phaser.Sprite that contain `Creature` object in `blr` property
   */
  onEnemyArrowOverlapPlayer: function (arrow, hero) {
    // just for clear `enemy` event
    // same as `onPlayerArrowOverlapEnemy`
    arrow.kill()
  },

  /**
   * Callback event when enemy arrow overlap enemy
   *
   * @param {[type]} arrow
   * @param {Phaser.Sprite} hero - Phaser.Sprite that contain `Creature` object in `blr` property
   */
  onEnemyArrowOverlapEnemy: function (arrow, hero) {
    // just for clear `enemy` event
    // same as `onPlayerArrowOverlapEnemy`
    arrow.kill()
  },

  /* ================================================================ Collide
   */

  onMonsterCollideStoneGroup: function () {

  },

  onPlayerCollideStoneGroup: function () {

  },

  onEnemyCollideStoneGroup: function () {

  },

  onPlayerCollideMonster: function () {
    // @todo when monster push hero
  },

  onEnemyCollideMonster: function () {
    // @todo when monster push hero
  },

  onPlayerCollideEnemy: function () {

  },

  /* ================================================================ Damage, Recover, Kill
   */

  /**
   * When creature is recovered, that checking
   * - alive
   * - life
   * - timestamp
   *
   * @param {Phaser.Sprite} creature - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {string} recoveredFrom
   */
  onCreatureIsRecovered: function (creature, recoveredFrom) {
    const ts = UTIL.getCurrentUtcTimestamp()

    if (creature.alive &&
      creature.blr.info.life < creature.blr.info.maxLife &&
      (ts > creature.blr.info.lastRecoverTimestamp + creature.blr.info.immortalDelay)) {
      this.player.blr.updateLastRecoverTimestamp()
      this.recoverCreature(creature, recoveredFrom)
    }
  },

  /**
   * When creature is damaged, that checking
   * - alive
   * - life
   * - timestamp
   * - immortal mode
   *
   * @param {Phaser.Sprite} creature - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {string} damageFrom - where is the damage come frome
   */
  onCreatureIsDamaged: function (creature, damageFrom) {
    const ts = UTIL.getCurrentUtcTimestamp()

    // force kill (just in case)
    if (creature.blr.info.life <= 0) this.killCreature(creature, damageFrom)

    if (creature.alive &&
      creature.blr.info.life > 0 &&
      !creature.blr.misc.isImmortal &&
      (ts > creature.blr.info.lastDamageTimestamp + creature.blr.info.immortalDelay)) {
      this.player.blr.updateLastDamageTimestamp()

      // if next damage will make creature die
      if (creature.blr.info.life - 1 <= 0) {
        this.killCreature(creature, damageFrom)
      } else {
        this.damageCreature(creature, damageFrom)
      }
    }
  },

  /**
   * When creature is recovered
   *
   * @param {Phaser.Sprite} creature - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {string} damageFrom - where is the damage come frome
   */
  recoverCreature: function (creature, recoveredFrom) {
    if (creature.blr.info.type === 'hero') {
      this.recoverHero(creature, recoveredFrom)
    } else {
      this.recoverMonster(creature, recoveredFrom)
    }
  },

  /**
   * When monster is recovered
   *
   * @param {Phaser.Sprite} monster - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {string} recoveredFrom
   */
  recoverMonster: function (monster, recoveredFrom) {
    // @todo complete it
  },

  /**
   * When hero is recovered
   *
   * @param {Phaser.Sprite} hero - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {string} recoveredFrom
   */
  recoverHero: function (hero, recoveredFrom) {
    send(EVENT_NAME.player.isRecovered, {
      playerInfo: hero.blr.info,
      recoveredFrom: recoveredFrom
    })
  },

  /**
   * When creature is damaged
   *
   * @param {Phaser.Sprite} creature - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {string} damageFrom - where is the damage come frome
   */
  damageCreature: function (creature, damageFrom) {
    if (creature.blr.info.type === 'hero') {
      if (this.isPlayer(creature)) {
        this.damagePlayer(creature, damageFrom)
      } else {
        this.damageEnemy(creature, damageFrom)
      }
    } else {
      this.damageMonster(creature, damageFrom)
    }
  },

  /**
   * When monster is damaged, checking monster type
   * then pick the eventName of that type
   *
   * @param {Phaser.Sprite} monster - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {string} damageFrom
   */
  damageMonster: function (monster, damageFrom) {
    const monsterType = monster.blr.info.type
    let eventName = ''

    switch (monsterType) {
      case 'zombie':
        eventName = EVENT_NAME.player.attackZombie
        break
      case 'machine':
        eventName = EVENT_NAME.player.attackMachine
        break
      case 'bat':
        eventName = EVENT_NAME.player.attackBat
        break
      default:
        break
    }

    if (!UTIL.isEmpty(eventName)) {
      send(eventName, {
        monsterInfo: monster.blr.info,
        damageFrom: damageFrom
      })
    }
  },

  /**
   * When player is damaged
   *
   * @param {Phaser.Sprite} hero - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {string} damageFrom
   */
  damagePlayer: function (hero, damageFrom) {
    send(EVENT_NAME.player.isDamaged, {
      playerInfo: hero.blr.info,
      damageFrom: damageFrom
    })
  },

  /**
   * When enemy is damaged
   *
   * @param {Phaser.Sprite} hero - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {string} damageFrom
   */
  damageEnemy: function (hero, damageFrom) {
    send(EVENT_NAME.player.attackEnemy, {
      playerInfo: hero.blr.info,
      damageFrom: damageFrom
    })
  },

  /**
   * Kill creature
   *
   * @param {Phaser.Sprite} creature - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {string} damageFrom
   */
  killCreature: function (creature, damageFrom) {
    if (creature.blr.info.type === 'hero') {
      if (this.isPlayer(creature)) {
        this.killPlayer(creature, damageFrom)
      } else {
        this.killEnemy(creature, damageFrom)
      }
    } else {
      this.killMonster(creature, damageFrom)
    }
  },

  /**
   * Kill monster
   *
   * @param {Phaser.Sprite} monster - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {string} damageFrom
   */
  killMonster: function (monster, damageFrom) {
    const monsterType = monster.blr.info.type
    let eventName = ''

    switch (monsterType) {
      case 'zombie':
        eventName = EVENT_NAME.player.killZombie
        break
      case 'machine':
        eventName = EVENT_NAME.player.killMachine
        break
      case 'bat':
        eventName = EVENT_NAME.player.killBat
        break
      default:
        break
    }

    if (!UTIL.isEmpty(eventName)) {
      send(eventName, {
        monsterInfo: monster.blr.info,
        damageFrom: damageFrom
      })
    }
  },

  /**
   * Kill player
   *
   * @param {Phaser.Sprite} hero - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {string} damageFrom
   */
  killPlayer: function (hero, damageFrom) {
    send(EVENT_NAME.player.isDied, {
      playerInfo: hero.blr.info,
      damageFrom: damageFrom
    })
  },

  /**
   * Kill enemy
   *
   * @param {Phaser.Sprite} hero - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {string} damageFrom
   */
  killEnemy: function (hero, damageFrom) {
    send(EVENT_NAME.player.killEnemy, {
      playerInfo: hero.blr.info,
      damageFrom: damageFrom
    })
  },

  /* ================================================================ Event
   */

  /**
   * Player fire arrow
   *
   * @param {Phaser.Sprite} hero - Phaser.Sprite that contain `Creature` object in `blr` property
   */
  playerFireArrow: function (hero) {
    const ts = UTIL.getCurrentUtcTimestamp()

    if (ts > hero.blr.misc.nextFireTimestamp &&
      hero.blr.bullet.countDead() > 0) {
      // update body rotation
      this.updateCreatureRotationByFollowingMouse(hero)

      // update sub
      this.updateCreatureWeapon(hero)

      // update last vector (update rotation)
      this.updateCreatureLastVector(hero)

      // update next fire
      hero.blr.misc.nextFireTimestamp = ts + hero.blr.misc.fireRate

      // fire
      const targetPos = new Position(
        GAME.input.activePointer.worldX,
        GAME.input.activePointer.worldY
      )
      this.heroFireArrow(hero, targetPos)

      // broadcast `fire` event
      const data = {
        playerInfo: this.player.blr.info,
        targetPos: targetPos
      }
      send(EVENT_NAME.player.fire, data)
    }
  },

  /**
   * Player fire arrow by keyboard
   * based on `playerFireArrow`
   *
   * @param {Phaser.Sprite} hero - Phaser.Sprite that contain `Creature` object in `blr` property
   */
  playerFireArrowByKeyboard: function (hero) {
    const ts = UTIL.getCurrentUtcTimestamp()

    if (ts > hero.blr.misc.nextFireTimestamp &&
      hero.blr.bullet.countDead() > 0) {
      // update next fire
      hero.blr.misc.nextFireTimestamp = ts + hero.blr.misc.fireRate

      // fire
      const r = 400
      const targetPos = new Position(
        this.player.x + Math.cos(this.player.rotation) * r,
        this.player.y + Math.sin(this.player.rotation) * r
      )
      this.heroFireArrow(hero, targetPos)

      // broadcast `fire` event
      send(EVENT_NAME.player.fire, {
        playerInfo: this.player.blr.info,
        targetPos: targetPos
      })
    }
  },

  /**
   * Enemy fire arrow
   *
   * @param {Phaser.Sprite} hero - Phaser.Sprite that contain `Creature` object in `blr` property
   */
  enemyFireArrow: function (hero, targetPos) {
    // force fire
    this.heroFireArrow(hero, targetPos)
  },

  /**
   * Fire arrow
   *
   * @param {Phaser.Sprite} hero - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {Position} targetPos
   */
  heroFireArrow: function (hero, targetPos) {
    // update lastVector rotation
    this.updateCreatureLastVector(hero)

    // set bullet animation
    // 2 bullet/sec (cause we have 7 frame per animation)
    hero.blr.weapon.animations.play('attack', 14, false, false)

    // fire
    const r = 40
    let bullet = hero.blr.bullet.getFirstExists(false)
    bullet.reset(
      hero.blr.weapon.x + Math.cos(hero.rotation) * r,
      hero.blr.weapon.y + Math.sin(hero.rotation) * r
    )
    bullet.rotation = GAME.physics.arcade.moveToXY(
      bullet,
      targetPos.x,
      targetPos.y,
      hero.blr.misc.bulletSpeed
    )
  },

  /**
   * Move player using mouse
   */
  playerMove: function () {
    // move
    GAME.physics.arcade.moveToPointer(this.player, this.player.blr.info.velocitySpeed)

    //  if it's overlapping the mouse, don't move any more
    if (Phaser.Rectangle.contains(this.player.body, GAME.input.x, GAME.input.y)) {
      this.player.body.velocity.setTo(0, 0)
    } else {
      // update body rotation
      this.updateCreatureRotationByFollowingMouse(this.player)

      // update sub
      this.updateCreatureWeapon(this.player)
      this.updateCreatureShadow(this.player)
      this.playDashParticle(this.player)
      this.updateCreatureBubblePosition(this.player)

      // update info
      this.updateCreatureLastVector(this.player)

      // broadcast `move` event
      send(EVENT_NAME.player.move, {
        playerInfo: this.player.blr.info
      })
    }
  },

  /**
   * Move player using keyboard (up cursor)
   * based on `playerMove
   */
  playerMoveByKeyboard: function () {
    GAME.physics.arcade.velocityFromAngle(
      this.player.angle,
      this.player.blr.info.velocitySpeed,
      this.player.body.velocity
    )

    // update sub
    this.updateCreatureWeapon(this.player)
    this.updateCreatureShadow(this.player)
    this.playDashParticle(this.player)
    this.updateCreatureBubblePosition(this.player)

    // update info
    this.updateCreatureLastVector(this.player)

    // broadcast `move` event
    send(EVENT_NAME.player.move, {
      playerInfo: this.player.blr.info
    })
  },

  /**
   * Rotate player using keyboard
   */
  playerRotateByKeyboard: function (angularVelocity) {
    this.player.body.angularVelocity = angularVelocity

    // update sub
    this.updateCreatureWeapon(this.player)

    // update info
    this.updateCreatureLastVector(this.player)

    // broadcast `move` event
    send(EVENT_NAME.player.rotate, {
      playerInfo: this.player.blr.info
    })
  },

  /**
   * Player send message
   */
  playerSendMessage: function () {
    const ts = UTIL.getCurrentUtcTimestamp()

    // if start typing
    if (!this.player.blr.misc.isTyping) {
      this.player.blr.updateLastEnterTimestamp(ts)
      this.player.blr.misc.isTyping = true

      UI.enableMessageInput()
    } else {
      this.player.blr.updateLastEnterTimestamp(ts)
      this.player.blr.misc.isTyping = false

      // update
      const message = UI.getMessageInput()
      if (message) {
        // set message
        this.player.blr.updateLastMessageTimestamp(ts)
        this.player.blr.info.lastMessage = message
        this.player.blr.bubble.setText(message)
        this.player.blr.bubble.visible = true

        // add message text to log
        this.logCreatureMessage(this.player)

        // broadcast `message` event
        send(EVENT_NAME.player.message, {
          playerInfo: this.player.blr.info
        })
      }

      UI.disableMessageInput()
    }
  },

  /**
   * AutoMove feature for monster
   * @todo complete it
   */
  autoMove: function () {

  },

  /* ================================================================ Socket
   */

  /**
   * Set all socket events
   */
  setSocketHandlers: function () {
    SOCKET.on(EVENT_NAME.server.newPlayer, this.onPlayerConnect.bind(this))
    SOCKET.on(EVENT_NAME.server.disconnectedPlayer, this.onPlayerDisconnect.bind(this))

    SOCKET.on(EVENT_NAME.player.message, this.onPlayerMessage.bind(this))
    SOCKET.on(EVENT_NAME.player.move, this.onPlayerMove.bind(this))
    SOCKET.on(EVENT_NAME.player.rotate, this.onPlayerRotate.bind(this))
    SOCKET.on(EVENT_NAME.player.fire, this.onPlayerFire.bind(this))

    SOCKET.on(EVENT_NAME.player.isDamaged, this.onPlayerIsDamaged.bind(this))
    SOCKET.on(EVENT_NAME.player.isDamagedItSelf, this.onPlayerIsDamagedItSelf.bind(this))

    SOCKET.on(EVENT_NAME.player.isRecovered, this.onPlayerIsRecovered.bind(this))
    SOCKET.on(EVENT_NAME.player.isRecoveredItSelf, this.onPlayerIsRecoveredItSelf.bind(this))

    SOCKET.on(EVENT_NAME.player.isDied, this.onPlayerIsDied.bind(this))
    SOCKET.on(EVENT_NAME.player.isDiedItSelf, this.onPlayerIsDiedItSelf.bind(this))

    SOCKET.on(EVENT_NAME.player.isRespawn, this.onPlayerIsRespawn.bind(this))
    SOCKET.on(EVENT_NAME.player.isRespawnItSelf, this.onPlayerIsRespawnItSelf.bind(this))

    SOCKET.on(EVENT_NAME.player.attackZombie, this.onPlayerAttackZombie.bind(this))
    SOCKET.on(EVENT_NAME.player.attackMachine, this.onPlayerAttackMachine.bind(this))
    SOCKET.on(EVENT_NAME.player.attackBat, this.onPlayerAttackBat.bind(this))

    SOCKET.on(EVENT_NAME.player.killZombie, this.onPlayerKillZombie.bind(this))
    SOCKET.on(EVENT_NAME.player.killMachine, this.onPlayerKillMachine.bind(this))
    SOCKET.on(EVENT_NAME.player.killBat, this.onPlayerKillBat.bind(this))

    SOCKET.on(EVENT_NAME.player.respawnZombie, this.onRespawnZombie.bind(this))
    SOCKET.on(EVENT_NAME.player.respawnMachine, this.onRespawnMachine.bind(this))
    SOCKET.on(EVENT_NAME.player.respawnBat, this.onRespawnBat.bind(this))

    SOCKET.on(EVENT_NAME.player.attackEnemy, this.onPlayerAttackEnemy.bind(this))
    SOCKET.on(EVENT_NAME.player.killEnemy, this.onPlayerKillEnemy.bind(this))
    SOCKET.on(EVENT_NAME.player.respawnEnemy, this.onRespawnEnemy.bind(this))

    SOCKET.on(EVENT_NAME.server.machineFire, this.onMachineFire.bind(this))

    SOCKET.on(EVENT_NAME.server.zombieMove, this.onZombieMove.bind(this))
    SOCKET.on(EVENT_NAME.server.batMove, this.onBatMove.bind(this))
  },

  /**
   * When player is ready to play
   *
   * @param {Object}
   */
  onPlayerReady: function (data) {
    const zombieInfos = data.zombieInfos
    const machineInfos = data.machineInfos
    const playerInfo = data.playerInfo
    const batInfos = data.batInfos
    const existingPlayerInfos = data.existingPlayerInfos

    this.VTMap = data.VTMap

    // draw VTMap to game
    if (IS_DEBUG) {
      this.debugMap()
    }

    // set miniMap
    this.setMiniMap()

    // monster - zombie
    const nZombies = zombieInfos.length
    for (let i = 0; i < nZombies; i++) {
      this.spawnZombie(zombieInfos[i])
    }

    // monster - machine
    const nMachines = machineInfos.length
    for (let i = 0; i < nMachines; i++) {
      this.spawnMachine(machineInfos[i])
    }

    // monster - bat
    const nBats = batInfos.length
    for (let i = 0; i < nBats; i++) {
      this.spawnBat(batInfos[i])
    }

    // hero - enemy
    const nEnemies = existingPlayerInfos.length
    for (let i = 0; i < nEnemies; i++) {
      this.spawnEnemy(existingPlayerInfos[i])
    }

    // hero - player
    this.spawnPlayer(playerInfo)

    // camera
    GAME.camera.follow(this.player)

    // reorder z-index (hack)
    // floor
    GAME.world.bringToTop(this.floorGroup)

    // shadow
    GAME.world.bringToTop(this.stoneShadowGroup)
    GAME.world.bringToTop(this.monsterShadowGroup)
    GAME.world.bringToTop(this.heroShadowGroup)

    GAME.world.bringToTop(this.stoneGroup)
    GAME.world.bringToTop(this.vtmapDebugGroup)

    // emitter
    GAME.world.bringToTop(this.dashEmitterGroup)
    GAME.world.bringToTop(this.recoverEmitterGroup)
    GAME.world.bringToTop(this.damageEmitterGroup)

    // monster
    GAME.world.bringToTop(this.zombieWeaponGroup)
    GAME.world.bringToTop(this.zombieGroup)
    GAME.world.bringToTop(this.machineGroup)
    GAME.world.bringToTop(this.machineWeaponGroup)
    GAME.world.bringToTop(this.batWeaponGroup)
    GAME.world.bringToTop(this.batGroup)

    // hero
    GAME.world.bringToTop(this.enemyWeaponGroup)
    GAME.world.bringToTop(this.enemyGroup)
    GAME.world.bringToTop(this.playerWeaponGroup)
    GAME.world.bringToTop(this.playerGroup)

    // bullet
    GAME.world.bringToTop(this.machineLaserGroup)
    GAME.world.bringToTop(this.enemyArrowGroup)
    GAME.world.bringToTop(this.playerArrowGroup)

    // sky
    GAME.world.bringToTop(this.treeGroup)
    GAME.world.bringToTop(this.miniMapBg)
    GAME.world.bringToTop(this.miniMapUnit)
    GAME.world.bringToTop(this.heroBubbleGroup)

    this.setSocketHandlers()
    this.isGameReady = true
  },

  /**
   * When enemy is connected
   *
   * @param {Object}
   */
  onPlayerConnect: function (data) {
    var playerInfo = data.playerInfo
    UTIL.clientLog('Enemy is connected', playerInfo)
    this.logOnPlayerConnect(playerInfo)

    // enemy
    this.spawnEnemy(playerInfo)
  },

  /**
   * When enemy is disconnected
   *
   * @param {Object}
   */
  onPlayerDisconnect: function (data) {
    const playerInfo = data.playerInfo
    UTIL.clientLog('Enemy is disconnected', playerInfo)
    this.logOnPlayerDisconnect(playerInfo)

    // remove enemy
    let isFound = false

    this.enemyGroup.forEach(function (enemy) {
      if (enemy.blr.info.id === playerInfo.id) {
        enemy.blr.bullet.destroy()
        enemy.blr.label.destroy()
        enemy.blr.bullet.destroy()
        enemy.blr.weapon.destroy()
        enemy.blr.shadow.destroy()
        enemy.destroy()

        // misc
        isFound = true
        UI.removeCreatureIdFromCreatureList(enemy.blr.info.id)
      }
    }, this)

    if (!isFound) {
      console.error('not found enemy ' + playerInfo.id, playerInfo)
    }
  },

  /**
   * When enemy send a message
   *
   * @param {Object}
   */
  onPlayerMessage: function (data) {
    const playerInfo = data.playerInfo
    let enemy = this.getEnemyByPlayerId(playerInfo.id)

    if (!UTIL.isEmptyObject(enemy)) {
      this.forceUpdateEnemyAfterGotSubsequentRequest(enemy, playerInfo.life, playerInfo.lastVector)

      // set message (same as `playerSendMessage`)
      enemy.blr.updateLastMessageTimestamp(playerInfo.lastMessageTimestamp)
      enemy.blr.info.lastMessage = playerInfo.lastMessage
      enemy.blr.bubble.setText(playerInfo.lastMessage)
      enemy.blr.bubble.visible = true

      // log (same as `playerSendMessage`)
      this.logCreatureMessage(enemy)
    }
  },

  /**
   * When enemy move
   *
   * @param {Object}
   */
  onPlayerMove: function (data) {
    const playerInfo = data.playerInfo
    const enemy = this.getEnemyByPlayerId(playerInfo.id)

    if (!UTIL.isEmptyObject(enemy)) {
      this.forceUpdateEnemyAfterGotSubsequentRequest(enemy, playerInfo.life, playerInfo.lastVector)

      // same as `playerMove`

      // update sub
      this.updateCreatureWeapon(enemy)
      this.updateCreatureShadow(enemy)
      this.playDashParticle(enemy)
      this.updateCreatureBubblePosition(enemy)

      // update info
      this.updateCreatureLastVector(enemy)
    }
  },

  /**
   * When enemy rotate
   *
   * @param {Object}
   */
  onPlayerRotate: function (data) {
    const playerInfo = data.playerInfo
    const enemy = this.getEnemyByPlayerId(playerInfo.id)

    if (!UTIL.isEmptyObject(enemy)) {
      this.forceUpdateEnemyAfterGotSubsequentRequest(enemy, playerInfo.life, playerInfo.lastVector)

      // same as `playerRotate`

      // update sub
      this.updateCreatureWeapon(enemy)

      // update info
      this.updateCreatureLastVector(enemy)
    }
  },

  /**
   * When enemy fire arrow
   *
   * @param {Object}
   */
  onPlayerFire: function (data) {
    const playerInfo = data.playerInfo
    const targetPos = data.targetPos
    const enemy = this.getEnemyByPlayerId(playerInfo.id)

    if (!UTIL.isEmptyObject(enemy)) {
      this.forceUpdateEnemyAfterGotSubsequentRequest(enemy, playerInfo.life, playerInfo.lastVector)

      // update sub (same as `playerFireArrow`)
      this.updateCreatureWeapon(enemy)

      this.enemyFireArrow(enemy, targetPos)
    }
  },

  /**
   * When enemy is damaged
   *
   * @param {Object}
   */
  onPlayerIsDamaged: function (data) {
    const playerInfo = data.playerInfo
    const damageFrom = data.damageFrom
    const enemy = this.getEnemyByPlayerId(playerInfo.id)

    if (!UTIL.isEmptyObject(enemy)) {
      this.forceUpdateEnemyAfterGotSubsequentRequest(enemy, playerInfo.life, playerInfo.lastVector)
      this.damageHeroAfterGotSubsequentRequest(enemy, damageFrom)
    }
  },

  /**
   * When player is damaged
   *
   * @param {Object}
   */
  onPlayerIsDamagedItSelf: function (data) {
    const damageFrom = data.damageFrom

    this.damageHeroAfterGotSubsequentRequest(this.player, damageFrom)
  },

  /**
   * When enemy is recovered
   *
   * @param {Object}
   */
  onPlayerIsRecovered: function (data) {
    const playerInfo = data.playerInfo
    const recoveredFrom = data.recoveredFrom
    const enemy = this.getEnemyByPlayerId(playerInfo.id)

    if (!UTIL.isEmptyObject(enemy)) {
      this.forceUpdateEnemyAfterGotSubsequentRequest(enemy, playerInfo.life, playerInfo.lastVector)
      this.recoverHeroAfterGotSubsequentRequest(enemy, recoveredFrom)
    }
  },

  /**
   * When player is recovered
   *
   * @param {Object}
   */
  onPlayerIsRecoveredItSelf: function (data) {
    const recoveredFrom = data.recoveredFrom

    this.recoverHeroAfterGotSubsequentRequest(this.player, recoveredFrom)
  },

  /**
   * When enemy is died
   *
   * @param {Object}
   */
  onPlayerIsDied: function (data) {
    const playerInfo = data.playerInfo
    const damageFrom = data.damageFrom
    const enemy = this.getEnemyByPlayerId(playerInfo.id)

    if (!UTIL.isEmptyObject(enemy)) {
      this.forceUpdateEnemyAfterGotSubsequentRequest(enemy, playerInfo.life, playerInfo.lastVector)
      this.killHeroAfterGotSubsequentRequest(enemy, damageFrom)
    }
  },

  /**
   * When player is died
   *
   * @param {Object}
   */
  onPlayerIsDiedItSelf: function (data) {
    const damageFrom = data.damageFrom

    this.killHeroAfterGotSubsequentRequest(this.player, damageFrom)
  },

  /**
   * When enemy is respawn
   *
   * @param {Object}
   */
  onPlayerIsRespawn: function (data) {
    const playerInfo = data.playerInfo
    const enemy = this.getEnemyByPlayerId(playerInfo.id)

    if (!UTIL.isEmptyObject(enemy)) {
      this.respawnHero(enemy, playerInfo)
    }
  },

  /**
   * When player is respawn
   *
   * @param {Object}
   */
  onPlayerIsRespawnItSelf: function (data) {
    const playerInfo = data.playerInfo

    // same as `onPlayerIsRespawn`
    this.respawnHero(this.player, playerInfo)
  },

  /**
   * when player / enemy attack zombie
   * @todo refactor
   *
   * @param {Object}
   */
  onPlayerAttackZombie: function (data) {
    const monsterInfo = data.monsterInfo
    const damageFrom = data.damageFrom
    const monster = this.getMonsterByMonsterIdAndGroup(monsterInfo.id, this.zombieGroup)

    if (!UTIL.isEmptyObject(monster)) {
      this.damageMonsterAfterGotSubsequentRequest(monster, damageFrom)
    }
  },

  /**
   * When player / enemy attack machine
   * @todo refactor
   *
   * @param {Object}
   */
  onPlayerAttackMachine: function (data) {
    const monsterInfo = data.monsterInfo
    const damageFrom = data.damageFrom
    const monster = this.getMonsterByMonsterIdAndGroup(monsterInfo.id, this.machineGroup)

    if (!UTIL.isEmptyObject(monster)) {
      this.damageMonsterAfterGotSubsequentRequest(monster, damageFrom)
    }
  },

  /**
   * When player / enemy attack bat
   * @todo refactor
   *
   * @param {Object}
   */
  onPlayerAttackBat: function (data) {
    const monsterInfo = data.monsterInfo
    const damageFrom = data.damageFrom
    const monster = this.getMonsterByMonsterIdAndGroup(monsterInfo.id, this.batGroup)

    if (!UTIL.isEmptyObject(monster)) {
      this.damageMonsterAfterGotSubsequentRequest(monster, damageFrom)
    }
  },

  /**
   * When player / enemy kill zombie
   * @todo refactor
   *
   * @param {Object}
   */
  onPlayerKillZombie: function (data) {
    const monsterInfo = data.monsterInfo
    const damageFrom = data.damageFrom
    const monster = this.getMonsterByMonsterIdAndGroup(monsterInfo.id, this.zombieGroup)

    if (!UTIL.isEmptyObject(monster)) {
      this.killMonsterAfterGotSubsequentRequest(monster, damageFrom)
    }
  },

  /**
   * When player / enemy kill machine
   * @todo refactor
   *
   * @param {Object}
   */
  onPlayerKillMachine: function (data) {
    const monsterInfo = data.monsterInfo
    const damageFrom = data.damageFrom
    const monster = this.getMonsterByMonsterIdAndGroup(monsterInfo.id, this.machineGroup)

    if (!UTIL.isEmptyObject(monster)) {
      this.killMonsterAfterGotSubsequentRequest(monster, damageFrom)
    }
  },

  /**
   * When player / enemy kill bat
   * @todo refactor
   *
   * @param {Object}
   */
  onPlayerKillBat: function (data) {
    const monsterInfo = data.monsterInfo
    const damageFrom = data.damageFrom
    const monster = this.getMonsterByMonsterIdAndGroup(monsterInfo.id, this.batGroup)

    if (!UTIL.isEmptyObject(monster)) {
      this.killMonsterAfterGotSubsequentRequest(monster, damageFrom)
    }
  },

  /**
   * When zombie is respawn
   * @todo refactor
   *
   * @param {Object}
   */
  onRespawnZombie: function (data) {
    const monsterInfo = data.monsterInfo
    const monster = this.getMonsterByMonsterIdAndGroup(monsterInfo.id, this.zombieGroup)

    if (!UTIL.isEmptyObject(monster)) {
      this.respawnMonster(monster, monsterInfo)
    }
  },

  /**
   * When machine is respawn
   * @todo refactor
   *
   * @param {Object}
   */
  onRespawnMachine: function (data) {
    const monsterInfo = data.monsterInfo
    const monster = this.getMonsterByMonsterIdAndGroup(monsterInfo.id, this.machineGroup)

    if (!UTIL.isEmptyObject(monster)) {
      this.respawnMonster(monster, monsterInfo)
    }
  },

  /**
   * When bat is respawn
   * @todo refactor
   *
   * @param {Object}
   */
  onRespawnBat: function (data) {
    const monsterInfo = data.monsterInfo
    const monster = this.getMonsterByMonsterIdAndGroup(monsterInfo.id, this.batGroup)

    if (!UTIL.isEmptyObject(monster)) {
      this.respawnMonster(monster, monsterInfo)
    }
  },

  /**
   * On player attack enemy
   * based on `onPlayerIsDamaged`
   *
   * @param {Object}
   */
  onPlayerAttackEnemy: function (data) {
    const playerInfo = data.playerInfo
    const damageFrom = data.damageFrom

    // I am attacked ?
    if (this.isPlayer(playerInfo.id)) {
      this.damageHeroAfterGotSubsequentRequest(this.player, damageFrom)
    } else {
      var enemy = this.getEnemyByPlayerId(playerInfo.id)

      this.damageHeroAfterGotSubsequentRequest(enemy, damageFrom)
    }
  },

  /**
   * On player kill enemy
   * based on `onPlayerIsDied`
   *
   * @param {Object}
   */
  onPlayerKillEnemy: function (data) {
    const playerInfo = data.playerInfo
    const damageFrom = data.damageFrom

    // I am died ?
    if (this.isPlayer(playerInfo.id)) {
      this.killHeroAfterGotSubsequentRequest(this.player, damageFrom)
    } else {
      var enemy = this.getEnemyByPlayerId(playerInfo.id)

      this.killHeroAfterGotSubsequentRequest(enemy, damageFrom)
    }
  },

  /**
   * On respawn enemy
   * based on `onPlayerIsRespawn`
   *
   * @param {Object}
   */
  onRespawnEnemy: function (data) {
    const playerInfo = data.playerInfo

    // I am respawn ?
    if (this.isPlayer(playerInfo.id)) {
      this.respawnHero(this.player, playerInfo)
    } else {
      var enemy = this.getEnemyByPlayerId(playerInfo.id)

      this.respawnHero(enemy, playerInfo)
    }
  },

  /**
   * On zombie move
   * @todo complete it
   *
   * @param {Array.Object}
   */
  onZombieMove: function (dataArr) {

  },

  /**
   * On machine fire
   * @todo complete it
   *
   * @param {Array.Object}
   */
  onMachineFire: function (dataArr) {
    const nData = dataArr.length

    for (let i = 0; i < nData; i++) {
      const data = dataArr[i]
      const monsterInfo = data.monsterInfo
      const targetVector = data.targetVector
      let monster = this.getMonsterByMonsterIdAndGroup(monsterInfo.id, this.machineGroup)

      if (!UTIL.isEmptyObject(monster)) {
        const ts = UTIL.getCurrentUtcTimestamp()

        if (monster.alive &&
          ts > monster.blr.misc.nextFireTimestamp &&
          monster.blr.bullet.countDead() > 0) {
          monster.blr.misc.nextFireTimestamp = ts + monster.blr.misc.fireRate

          let bullet = monster.blr.bullet.getFirstDead()
          bullet.reset(monster.blr.weapon.x, monster.blr.weapon.y)
          bullet.rotation = GAME.physics.arcade.moveToXY(
            bullet,
            targetVector.x,
            targetVector.y,
            monster.blr.misc.bulletSpeed
          )
        }
      }
    }
  },

  /**
   * On bat move
   * @todo complete it
   *
   * @param {Array.Object}
   */
  onBatMove: function (dataArr) {

  },

  /* ================================================================ Socket subsequent request
   */

  /**
   * Kill hero after got subsequent request
   *
   * @param {Phaser.Sprite} hero - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {strimg} damageFrom
   */
  killHeroAfterGotSubsequentRequest: function (hero, damageFrom) {
    hero.blr.info.life--
    hero.blr.updateLastDamageTimestamp()

    this.playDamageParticle(hero)
    hero.animations.play('blink', 10, false, false)

    hero.blr.label.kill()
    hero.blr.shadow.kill()
    hero.blr.weapon.kill()
    hero.blr.bubble.kill()
    // hero.blr.bullet.kill();
    hero.kill()

    this.logOnCreatureIsDied(hero, damageFrom)
  },

  /**
   * Kill monster after got subsequent request
   * based on `killHeroAfterGotSubsequentRequest`
   *
   * @param {Phaser.Sprite} monster - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {strimg} damageFrom
   */
  killMonsterAfterGotSubsequentRequest: function (monster, damageFrom) {
    monster.blr.info.life--
    monster.blr.updateLastDamageTimestamp()

    this.playDamageParticle(monster)
    monster.animations.play('blink', 10, false, false)

    monster.blr.label.kill()
    monster.blr.shadow.kill()
    monster.blr.weapon.kill()
    // monster.blr.bubble.kill();
    // monster.blr.bullet.kill();
    monster.kill()

    this.logOnCreatureIsDied(monster, damageFrom)
  },

  /**
   * Recover hero after got subsequent request
   *
   * @param {Phaser.Sprite} hero - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {strimg} recoveredFrom
   */
  recoverHeroAfterGotSubsequentRequest: function (hero, recoveredFrom) {
    hero.blr.info.life++

    this.playRecoverParticle(hero)
    hero.animations.play('recover', 10, false, false)
    this.logOnCreatureIsRecovered(hero, recoveredFrom)
  },

  /**
   * Damage hero after got subsequent request
   *
   * @param {Phaser.Sprite} hero - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {strimg} damageFrom
   */
  damageHeroAfterGotSubsequentRequest: function (hero, damageFrom) {
    hero.blr.info.life--

    this.playDamageParticle(hero)
    hero.animations.play('blink', 10, false, false)
    this.logOnCreatureIsDamaged(hero, damageFrom)
  },

  /**
   * Damage monster after got subsequent request
   *
   * @param {Phaser.Sprite} monster - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {strimg} damageFrom
   */
  damageMonsterAfterGotSubsequentRequest: function (monster, damageFrom) {
    // same as `damageHeroAfterGotSubsequentRequest`
    monster.blr.info.life--

    this.playDamageParticle(monster)
    monster.animations.play('blink', 10, false, false)
    this.logOnCreatureIsDamaged(monster, damageFrom)
  },

  /**
   * forceUpdateEnemyAfterGotSubsequentRequest
   * same as `forceUpdateCreatureAfterGotSubsequentRequest`
   *
   * @param {Phaser.Sprite} enemy - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {number} life
   * @param {Vector} currentVector
   */
  forceUpdateEnemyAfterGotSubsequentRequest: function (enemy, life, currentVector) {
    this.forceUpdateCreatureAfterGotSubsequentRequest(enemy, life, currentVector)
  },

  /**
   * This function will force update
   * it's used every time when receive enemy event data from socket event except
   * - ready
   * - connect
   * - disconnect
   * - respawn
   * - monster related (cause it's completely controlled by server)
   * - enemy related (cause it's completely controlled by other clients)
   * so, now we only force update player event
   *
   * and it will force update
   * - life
   * - body x
   * - body y
   * - body rotation
   *
   * @param {Phaser.Sprite} creature - Phaser.Sprite that contain `Creature` object in `blr` property
   * @param {number} life
   * @param {Vector} currentVector
   */
  forceUpdateCreatureAfterGotSubsequentRequest: function (creature, life, currentVector) {
    creature.blr.info.life = life
    creature.x = currentVector.x
    creature.y = currentVector.y
    creature.rotation = currentVector.rotation
  },

  /* ================================================================ Stage
   */

  preload: function () {

  },

  init: function () {
    // floor
    this.floorGroup = GAME.add.group()
    this.stoneShadowGroup = GAME.add.group()
    this.stoneGroup = GAME.add.group()
    this.vtmapDebugGroup = GAME.add.group()

    // monster
    this.monsterShadowGroup = GAME.add.group()
    this.zombieWeaponGroup = GAME.add.group()
    this.zombieGroup = GAME.add.group()
    this.machineWeaponGroup = GAME.add.group()
    this.machineGroup = GAME.add.group()
    this.batWeaponGroup = GAME.add.group()
    this.batGroup = GAME.add.group()

    // hero
    this.heroShadowGroup = GAME.add.group()
    this.enemyWeaponGroup = GAME.add.group()
    this.enemyGroup = GAME.add.group()
    this.playerWeaponGroup = GAME.add.group()
    this.playerGroup = GAME.add.group()

    // bullet
    this.machineLaserGroup = GAME.add.group()
    this.enemyArrowGroup = GAME.add.group()
    this.playerArrowGroup = GAME.add.group()

    // sky
    this.treeGroup = GAME.add.group()
    this.miniMapBg = GAME.add.group()
    this.miniMapUnit = GAME.add.group()
    this.heroBubbleGroup = GAME.add.group()

    // disable default right-click's behavior on the canvas
    GAME.canvas.oncontextmenu = function (e) {
      e.preventDefault()
    }

    // misc
    GAME.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    GAME.scale.pageAlignHorizontally = true
    GAME.scale.pageAlignVertically = true
    GAME.input.mouse.capture = true
    GAME.stage.disableVisibilityChange = true
    GAME.scale.setResizeCallback(function () {
      GAME.scale.setGameSize(window.innerWidth, window.innerHeight)
    })

    // socket
    SOCKET.on('connect', function () {
      UTIL.clientLog('Connected to server')
    })

    SOCKET.on('disconnect', function () {
      UTIL.clientLog('Disconnected from ' + SOCKET_URL)
    })

    // player is ready
    SOCKET.on(EVENT_NAME.player.ready, this.onPlayerReady.bind(this))
  },

  create: function () {
    GAME.time.advancedTiming = true

    // world
    GAME.world.setBounds(0, 0, GAME_WORLD_WIDTH, GAME_WORLD_HEIGHT)

    // system & world
    GAME.physics.startSystem(Phaser.Physics.ARCADE)

    // bg
    GAME.stage.backgroundColor = '#3db148'

    // map - floor
    var map = GAME.add.tilemap('mapTile')
    map.addTilesetImage('map')
    this.floorGroup = map.createLayer(0)
    this.floorGroup.resizeWorld()
    map.setTileIndexCallback(5, this.onCreatureOverlapWell, this, this.floorGroup)
    map.setTileIndexCallback(6, this.onCreatureOverlapFire, this, this.floorGroup)

    // map - stone (rock, bush)
    this.stoneGroup = map.createLayer(1)
    map.setCollision([1, 3], true, this.stoneGroup)
    map.forEach(function (tile) {
      if (tile.index === 1 || tile.index === 3) {
        var stoneShadow = GAME.add.sprite(tile.worldX, tile.worldY, 'shadow')
        stoneShadow.scale.setTo(0.7, 0.7)
        stoneShadow.alpha = 0.3
        this.stoneShadowGroup.add(stoneShadow)
      }
    }, this, 0, 0, 50, 50, this.stoneGroup)

    // map - tree
    this.treeGroup = map.createLayer(2)

    // keyboard
    this.spaceKey = GAME.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    this.enterKey = GAME.input.keyboard.addKey(Phaser.Keyboard.ENTER)
    this.cursors = GAME.input.keyboard.createCursorKeys()

    // emitter
    this.setDashEmitter()
    this.setRecoverEmitter()
    this.setDamageEmitter()

    // player ready
    send(EVENT_NAME.player.ready, null)
  },

  update: function () {
    if (this.isGameReady) {
      const ts = UTIL.getCurrentUtcTimestamp()

      // collide - creature with floorGroup
      // GAME.physics.arcade.collide(this.zombieGroup, this.floorGroup);
      // GAME.physics.arcade.collide(this.machineGroup, this.floorGroup);
      // GAME.physics.arcade.collide(this.batGroup, this.floorGroup);
      GAME.physics.arcade.collide(this.playerGroup, this.floorGroup)

      // collide - creature with stoneGroup
      // GAME.physics.arcade.collide(this.zombieGroup, this.stoneGroup, this.onMonsterCollideStoneGroup, null, this);
      // GAME.physics.arcade.collide(this.machineGroup, this.stoneGroup, this.onMonsterCollideStoneGroup, null, this);
      // GAME.physics.arcade.collide(this.batGroup, this.stoneGroup, this.onMonsterCollideStoneGroup, null, this);
      GAME.physics.arcade.collide(this.playerGroup, this.stoneGroup, this.onPlayerCollideStoneGroup, null, this)
      GAME.physics.arcade.collide(this.enemyGroup, this.stoneGroup, this.onEnemyCollideStoneGroup, null, this)

      // collide - player with monster
      GAME.physics.arcade.collide(this.playerGroup, this.zombieGroup, this.onPlayerCollideMonster, null, this)
      GAME.physics.arcade.collide(this.playerGroup, this.machineGroup, this.onPlayerCollideMonster, null, this)
      GAME.physics.arcade.collide(this.playerGroup, this.batGroup, this.onPlayerCollideMonster, null, this)

      // collide - enemy with monster
      GAME.physics.arcade.collide(this.enemyGroup, this.zombieGroup, this.onEnemyCollideMonster, null, this)
      GAME.physics.arcade.collide(this.enemyGroup, this.machineGroup, this.onEnemyCollideMonster, null, this)
      GAME.physics.arcade.collide(this.enemyGroup, this.batGroup, this.onEnemyCollideMonster, null, this)

      // collide - player with enemy
      GAME.physics.arcade.collide(this.playerGroup, this.enemyGroup, this.onPlayerCollideEnemy, null, this)

      // overlap - player with monster
      GAME.physics.arcade.overlap(this.playerGroup, this.zombieGroup, this.onPlayerOverlapZombie, null, this)
      GAME.physics.arcade.overlap(this.playerGroup, this.machineGroup, this.onPlayerOverlapMachine, null, this)
      GAME.physics.arcade.overlap(this.playerGroup, this.batGroup, this.onPlayerOverlapBat, null, this)

      // overlap - player with monster weapon
      GAME.physics.arcade.overlap(this.playerGroup, this.zombieWeaponGroup, this.onPlayerOverlapZombieWeapon, null, this)
      GAME.physics.arcade.overlap(this.playerGroup, this.machineWeaponGroup, this.onPlayerOverlapMachineWeapon, null, this)
      GAME.physics.arcade.overlap(this.playerGroup, this.batWeaponGroup, this.onPlayerOverlapBatWeapon, null, this)

      // overlap - arrow with monster
      GAME.physics.arcade.overlap(this.playerArrowGroup, this.zombieGroup, this.onPlayerArrowOverlapMonster, null, this)
      GAME.physics.arcade.overlap(this.playerArrowGroup, this.machineGroup, this.onPlayerArrowOverlapMonster, null, this)
      GAME.physics.arcade.overlap(this.playerArrowGroup, this.batGroup, this.onPlayerArrowOverlapMonster, null, this)
      GAME.physics.arcade.overlap(this.enemyArrowGroup, this.zombieGroup, this.onEnemyArrowOverlapMonster, null, this)
      GAME.physics.arcade.overlap(this.enemyArrowGroup, this.machineGroup, this.onEnemyArrowOverlapMonster, null, this)
      GAME.physics.arcade.overlap(this.enemyArrowGroup, this.batGroup, this.onEnemyArrowOverlapMonster, null, this)

      // overlap - arrow with hero
      GAME.physics.arcade.overlap(this.playerArrowGroup, this.enemyGroup, this.onPlayerArrowOverlapEnemy, null, this)
      GAME.physics.arcade.overlap(this.playerArrowGroup, this.playerGroup, this.onPlayerArrowOverlapPlayer, null, this)
      GAME.physics.arcade.overlap(this.enemyArrowGroup, this.playerGroup, this.onEnemyArrowOverlapPlayer, null, this)
      GAME.physics.arcade.overlap(this.enemyArrowGroup, this.enemyGroup, this.onEnemyArrowOverlapEnemy, null, this)

      // overlap - machine laser with hero
      GAME.physics.arcade.overlap(this.machineLaserGroup, this.playerGroup, this.onMachineLaserOverlapPlayer, null, this)
      GAME.physics.arcade.overlap(this.machineLaserGroup, this.enemyGroup, this.onMachineLaserOverlapEnemy, null, this)

      // reset emiiter
      this.fadeAllEmitters()

      // reset - bubble - enemy
      this.enemyGroup.forEachAlive(function (creature) {
        this.updateCreatureBubbleVisibility(creature)
      }, this)

      // player
      if (this.player.alive) {
        // reset
        this.player.body.velocity.x = 0
        this.player.body.velocity.y = 0
        this.player.body.angularVelocity = 0

        // reset - bubble
        this.updateCreatureBubbleVisibility(this.player)

        // move & rotate (mouse over keyboard)
        // input - left click (move follow mouse)
        // input - left || right (rotate)
        // input - up (move follow rotation)
        if (GAME.input.activePointer.leftButton.isDown) {
          this.playerMove()
        } else {
          let angularVelocity = 0

          if (this.cursors.left.isDown) {
            angularVelocity = -this.playerAngularVelocity
          } else if (this.cursors.right.isDown) {
            angularVelocity = this.playerAngularVelocity
          }

          if (angularVelocity !== 0) {
            this.playerRotateByKeyboard(angularVelocity)
          }

          // move
          if (this.cursors.up.isDown) {
            this.playerMoveByKeyboard()
          }
        }

        // fire (mouse over keyboard)
        // input - right click (fire follow mouse)
        // input - spacebar (fire follow rotation)
        if (GAME.input.activePointer.rightButton.isDown) {
          this.playerFireArrow(this.player)
        } else if (this.spaceKey.isDown) {
          this.playerFireArrowByKeyboard(this.player)
        }

        // message
        // 200 is key pressing delay
        if (this.enterKey.isDown && ts - this.player.blr.misc.lastEnterTimestamp > this.enterKeyDelay) {
          this.playerSendMessage()
        }
      }

      // monster - zombie
      this.zombieGroup.forEachAlive(function (monster) {
        this.autoMove(monster)
      }, this)

      // monster - machine
      this.machineGroup.forEachAlive(function (monster) {
        // fire
        const nearestHero = this.getNearestHero(monster.blr.info.lastVector)
        const newWeaponRotation = GAME.physics.arcade.angleBetween(monster, nearestHero)

        this.updateCreatureWeapon(monster, monster.x, monster.y, newWeaponRotation)
      }, this)

      // monster - bat
      this.batGroup.forEachAlive(function (monster) {
        this.autoMove(monster)
      }, this)

      this.updateMinimap()
    }
  },

  preRender: function () {
    if (this.isGameReady) {
      // hero - player
      if (this.player.alive) {
        this.updateCreatureLabelText(this.player)
      }

      // hero - enemy
      this.enemyGroup.forEachAlive(function (hero) {
        this.updateCreatureLabelText(hero)
      }, this)

      // monster - zombie
      this.zombieGroup.forEachAlive(function (monster) {
        this.updateCreatureLabelText(monster)
      }, this)

      // monster - machine
      this.machineGroup.forEachAlive(function (monster) {
        this.updateCreatureLabelText(monster)
      }, this)

      // monster - bat
      this.batGroup.forEachAlive(function (monster) {
        this.updateCreatureLabelText(monster)
      }, this)
    }
  },

  render: function () {
    if (this.isGameReady && IS_DEBUG) {
      const creatureBodyDebugColor = 'rgba(0,255, 0, 0.4)'
      const weaponBodyDebugColor = 'rgba(215, 125, 125, 0.4)'

      // top
      GAME.debug.bodyInfo(this.player, 264, 18)
      GAME.debug.spriteInfo(this.player, 264, 120)

      // middle
      GAME.debug.start(6, 276)
      GAME.debug.line('Frames per second (FPS) ' + GAME.time.fps)
      GAME.debug.line('zombieGroup living ' + this.zombieGroup.countLiving())
      GAME.debug.line('zombieGroup dead ' + this.zombieGroup.countDead())
      GAME.debug.line('machineGroup living ' + this.machineGroup.countLiving())
      GAME.debug.line('machineGroup dead ' + this.machineGroup.countDead())
      GAME.debug.line('batGroup living ' + this.batGroup.countLiving())
      GAME.debug.line('batGroup dead ' + this.batGroup.countDead())
      GAME.debug.stop()

      // weapon body
      GAME.debug.body(this.player.blr.weapon, creatureBodyDebugColor)

      this.zombieWeaponGroup.forEachAlive(function (weapon) {
        GAME.debug.body(weapon, weaponBodyDebugColor)
      }, this)

      this.machineWeaponGroup.forEachAlive(function (weapon) {
        GAME.debug.body(weapon, weaponBodyDebugColor)
      }, this)

      this.batWeaponGroup.forEachAlive(function (weapon) {
        GAME.debug.body(weapon, weaponBodyDebugColor)
      }, this)

      // creature body
      GAME.debug.body(this.player, creatureBodyDebugColor)

      this.zombieGroup.forEachAlive(function (monster) {
        GAME.debug.body(monster, creatureBodyDebugColor)
      }, this)

      this.machineGroup.forEachAlive(function (monster) {
        GAME.debug.body(monster, creatureBodyDebugColor)
      }, this)

      this.batGroup.forEachAlive(function (monster) {
        GAME.debug.body(monster, creatureBodyDebugColor)
      }, this)
    }
  }
}

module.exports = Play
