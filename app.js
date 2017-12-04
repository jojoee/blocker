/**
 * Server entry file
 */

const EXPRESS = require('express')
const APP = EXPRESS()
const PATH = require('path')
const SHORTID = require('shortid')
const SERVER = require('http').Server(APP)
const IO = require('socket.io')(SERVER)
const UTIL = require('./common/util')
const GUTIL = require('./common/gutil')
const CONFIG = require('./common/config')
const mapJson = require('./public/src/asset/image/map.json')
const MODULE = require('./common/module')
const Vector = MODULE.Vector
const CreatureInfo = MODULE.CreatureInfo
let VTMAP = {}

const SERVER_PORT = CONFIG.serverPort
const EVENT_NAME = CONFIG.eventName
const STATIC_PATH = PATH.join(__dirname, '/public')
const COMMON_PATH = PATH.join(__dirname, '/common')
const SERVER_HEARTBEAT = 100
// const IS_DEBUG = CONFIG.isDebug

/** @type {Array.CreatureInfo} */
let ZOMBIE_INFOS = []

/** @type {Array.CreatureInfo} */
let MACHINE_INFOS = []

/** @type {Array.CreatureInfo} */
let BAT_INFOS = []

/** @type {Array.CreatureInfo} */
let PLAYER_INFOS = []

/* ================================================================ App & Init
 */

initVirtualMap()
initMonsters()

// disable bot (for now)
// initBots();

// Set static file
APP.use('/public', EXPRESS.static(STATIC_PATH))
APP.use('/common', EXPRESS.static(COMMON_PATH))

APP.get('/', function (req, res) {
  res.sendFile(STATIC_PATH + '/index.html')
})

SERVER.listen(SERVER_PORT, function (err) {
  if (err) {
    throw err
  } else {
    UTIL.serverLog('Listening on port: ' + SERVER_PORT)
  }
})

/* ================================================================ Socket util
 */

/**
 * Get number of client connection by checking io connection
 *
 * @see http://stackoverflow.com/questions/10275667/socket-io-connected-user-count
 *
 * @returns {number}
 */
function getNumberOfConnection () {
  return IO.engine.clientsCount
}

/* ================================================================ Init
 */

/**
 * Initial virtual map
 * 1: layer 1 - bush
 * 2: layer 0 - ground
 * 3: layer 1 - rock
 * 4: layer 2 - tree
 * 5: layer 0 - well
 * 6: layer 0 - fire
 */
function initVirtualMap () {
  // VTMAP
  VTMAP.mapTileWidth = mapJson.tilewidth
  VTMAP.mapTileHeight = mapJson.tileheight
  VTMAP.nTileWidth = mapJson.width
  VTMAP.nTileHeight = mapJson.height
  VTMAP.data = UTIL.creature2DArray(
    VTMAP.nTileWidth,
    VTMAP.nTileHeight,
    0
  )

  // row
  for (let i = 0; i < VTMAP.nTileHeight; i++) {
    // column
    for (let j = 0; j < VTMAP.nTileWidth; j++) {
      var idx = i * VTMAP.nTileWidth + j

      // floor
      var tmp1 = mapJson.layers[0].data[idx]
      if (tmp1 === 5 || tmp1 === 6) VTMAP.data[i][j] = tmp1

      // stone
      var tmp2 = mapJson.layers[1].data[idx]
      if (tmp2 === 1 || tmp2 === 3) VTMAP.data[i][j] = tmp2
    }
  }
}

/**
 * Initial monster
 * - zombie
 * - machine
 * - bat
 *
 * @todo n of init monster should be in config
 */
function initMonsters () {
  const nZombies = 8
  const nMachines = 8
  const nBats = 8

  for (let i = 0; i < nZombies; i++) {
    let creatureInfo = getNewZombieInfo()
    ZOMBIE_INFOS.push(creatureInfo)
  }

  for (let i = 0; i < nMachines; i++) {
    let creatureInfo = getNewMachineInfo()
    MACHINE_INFOS.push(creatureInfo)
  }

  for (let i = 0; i < nBats; i++) {
    let creatureInfo = getNewBatInfo()
    BAT_INFOS.push(creatureInfo)
  }
}

/**
 * Initial bot player
 * - stay
 *
 * @todo move nBots to config
 */
function initBots () { // eslint-disable-line
  const nBots = 4

  for (let i = 0; i < nBots; i++) {
    var heroInfo = getNewPlayerInfo()
    PLAYER_INFOS.push(heroInfo)
  }
}

/* ================================================================ Game
 */

/**
 * Get new CreatureInfo of zombie
 *
 * @returns {CreatureInfo}
 */
function getNewZombieInfo () {
  return getNewCreatureInfo('zombie', 100, 4, 6)
}

/**
 * Get new CreatureInfo of machine
 *
 * @returns {CreatureInfo}
 */
function getNewMachineInfo () {
  return getNewCreatureInfo('machine', 0, 5, 5)
}

/**
 * Get new CreatureInfo of bat
 *
 * @returns {CreatureInfo}
 */
function getNewBatInfo () {
  return getNewCreatureInfo('bat', 120, 3, 3)
}

/**
 * Get new CreatureInfo of hero
 *
 * @returns {CreatureInfo}
 */
function getNewPlayerInfo () {
  return getNewCreatureInfo('hero', 200, 3, 8)
}

/**
 * Get new creature info
 *
 * @param {string} type
 * @param {number} life
 * @param {number} maxLife
 * @returns {CreatureInfo}
 */
function getNewCreatureInfo (type, velocitySpeed, life, maxLife) {
  const creatureId = getUniqueCreatureId()
  const startVector = getRandomStartCreatureVector()
  const creatureInfo = new CreatureInfo(creatureId, type, startVector, velocitySpeed, life, maxLife)

  return creatureInfo
}

/**
 * Get random walkable creature position
 *
 * @param {Position|Vector} currentPos
 * @param {number} minimumDistance
 * @returns {Position}
 */
function getRandomWalkableCreaturePosition (currentPos, minimumDistance) { // eslint-disable-line
  if (typeof minimumDistance === 'undefined') minimumDistance = 0

  let targetPos = {}
  let distance = 0
  let isNotOk = true

  while (isNotOk) {
    targetPos = getCreaturePositionByExclusion([1, 3, 5, 6])
    distance = UTIL.getDistanceBetween(currentPos, targetPos)

    if (distance >= minimumDistance) {
      isNotOk = false
    }
  }

  return targetPos
}

/**
 * Get random start creature position
 * not be allowed at
 * - fire
 * - bush
 * - well
 * - stone
 *
 * @returns {Position} start position
 */
function getRandomStartCreaturePosition () {
  return getCreaturePositionByExclusion([1, 3, 5, 6])
}

/**
 * Get random start creature vector
 * not be allowed at
 * - fire
 * - bush
 * - well
 * - stone
 *
 * @returns {Vector} start vector
 */
function getRandomStartCreatureVector () {
  const startPosition = getRandomStartCreaturePosition()
  const startRotation = GUTIL.getRandomRotation()
  const startVector = new Vector(startPosition.x, startPosition.y, startRotation)

  return startVector
}

/**
 * Get random creature position (real x, y in map)
 * by excluding given `arr`
 *
 * note
 * it's work, if all creature sprites is not over than
 * mapTileWidth and mapTileHeight
 *
 * @param {Array.number} arr - Array of tile index that you do not want
 * @returns {Position} return position (middle of tile)
 */
function getCreaturePositionByExclusion (arr) {
  const nTileWidth = VTMAP.nTileWidth
  const nTileHeight = VTMAP.nTileHeight
  const tileWidth = VTMAP.mapTileWidth
  const tileHeight = VTMAP.mapTileHeight
  let tileIndexX
  let tileIndexY
  let isNotOk = true

  while (isNotOk) {
    tileIndexX = UTIL.getRandomInt(0, nTileWidth - 1)
    tileIndexY = UTIL.getRandomInt(0, nTileHeight - 1)

    // if the tile value is not be contained in
    if (arr.indexOf(VTMAP.data[tileIndexY][tileIndexX]) === -1) {
      isNotOk = false
    }
  }

  const middlePos = GUTIL.convertTileIndexToPoint(
    tileIndexX,
    tileIndexY,
    tileWidth,
    tileHeight,
    true
  )

  return middlePos
}

/**
 * Reset creatureInfo
 * used for respawning only (server side only)
 *
 * @param {CreatureInfo} creatureInfo
 * @param {Vector} startVector
 * @returns {CreatureInfo} creatureInfo
 */
function resetCreatureInfo (creatureInfo, startVector) {
  creatureInfo.life = creatureInfo.initialLife
  creatureInfo.startVector = startVector
  creatureInfo.lastVector = startVector
  creatureInfo.autoMove = {}

  return creatureInfo
}

/**
 * Check the `creatureId` is already existing in the `creatureInfos`
 *
 * @param {string} creatureId
 * @param {Array.CreatureInfo} creatureInfos
 * @returns {boolean}
 */
function isDuplicateCreatureId (creatureId, creatureInfos) {
  let isDuplicated = false
  const n = creatureInfos.length

  for (let i = 0; i < n; i++) {
    var creatureInfo = creatureInfos[i]

    if (creatureInfo.id === creatureId) {
      isDuplicated = true
      break
    }
  }

  return isDuplicated
}

/**
 * Get unique creature id
 *
 * @returns {string}
 */
function getUniqueCreatureId () {
  let creatureId
  let isDuplicated = true

  while (isDuplicated) {
    creatureId = SHORTID.generate()

    if (!isDuplicateCreatureId(creatureId, ZOMBIE_INFOS) &&
      !isDuplicateCreatureId(creatureId, MACHINE_INFOS) &&
      !isDuplicateCreatureId(creatureId, BAT_INFOS) &&
      !isDuplicateCreatureId(creatureId, PLAYER_INFOS)) {
      isDuplicated = false
    }
  }

  return creatureId
}

/**
 * Get playerInfo index by id
 *
 * @param {string} playerId
 * @returns {number} return integer number when it's found (return -1, if not found)
 */
function getPlayerInfoIndexById (playerId) {
  const nPlayers = PLAYER_INFOS.length

  for (let i = 0; i < nPlayers; i++) {
    if (PLAYER_INFOS[i].id === playerId) {
      return i
    }
  }

  UTIL.serverBugLog('getPlayerInfoIndexById', 'Not found playerId', playerId)

  return -1
}

/**
 * Get monsterInfo index
 *
 * @param {string} monsterId
 * @param {Array} monsterInfos
 * @returns {number} return integer number when it's found (return -1, if not found)
 */
function getMonsterInfoIndex (monsterId, monsterInfos) {
  const nMonsters = monsterInfos.length

  for (let i = 0; i < nMonsters; i++) {
    if (monsterInfos[i].id === monsterId) {
      return i
    }
  }

  UTIL.serverBugLog('getMonsterInfoIndex', 'Not found monsterId', monsterId)

  return -1
}

/**
 * Check this player is already
 * exists in the server
 *
 * @param {string} playerId
 * @returns {boolean}
 */
function isExistingPlayer (playerId) { // eslint-disable-line
  return (getPlayerInfoIndexById(playerId) > -1)
}

/**
 * Remove player out of PLAYER_INFOS
 *
 * @param {string} playerId
 * @returns
 */
function removePlayer (playerId) {
  const playerIdx = getPlayerInfoIndexById(playerId)

  if (playerIdx > -1) {
    PLAYER_INFOS.splice(playerIdx, 1)

    return true
  }

  return false
}

/* ================================================================ Socket
 */

IO.on('connection', function (socket) {
  const socketId = socket.id
  let playerInfo = getNewPlayerInfo()

  UTIL.serverLog(playerInfo.id + ' is connect')

  // disconnect
  socket.on('disconnect', function () {
    UTIL.serverLog(playerInfo.id + ' is disconnect')

    // remove player
    removePlayer(playerInfo.id)

    // send disconnected player
    const data = {
      playerInfo: playerInfo
    }
    socket.broadcast.emit(EVENT_NAME.server.disconnectedPlayer, data)
  })

  // ready
  socket.on(EVENT_NAME.player.ready, function () {
    // data for new player
    const data1 = {
      VTMap: VTMAP,
      playerInfo: playerInfo,
      existingPlayerInfos: PLAYER_INFOS,
      zombieInfos: ZOMBIE_INFOS,
      machineInfos: MACHINE_INFOS,
      batInfos: BAT_INFOS
    }
    IO.sockets.connected[socketId].emit(EVENT_NAME.player.ready, data1)

    // add new player
    PLAYER_INFOS.push(playerInfo)

    // broadcast new player data
    // to existing players
    const data2 = {
      playerInfo: playerInfo
    }
    socket.broadcast.emit(EVENT_NAME.server.newPlayer, data2)
  })

  // ping
  socket.on(EVENT_NAME.player.ping, function () {
    IO.sockets.connected[socketId].emit(EVENT_NAME.player.ping)
  })

  // message
  // @todo refactor cause it has the same behavior
  socket.on(EVENT_NAME.player.message, function (data) {
    const playerInfo = data.playerInfo
    const playerIdx = getPlayerInfoIndexById(playerInfo.id)

    if (playerIdx > -1) {
      PLAYER_INFOS[playerIdx] = playerInfo
      socket.broadcast.emit(EVENT_NAME.player.message, data)
    }
  })

  // move
  // @todo refactor cause it has the same behavior
  socket.on(EVENT_NAME.player.move, function (data) {
    const playerInfo = data.playerInfo
    const playerIdx = getPlayerInfoIndexById(playerInfo.id)

    if (playerIdx > -1) {
      PLAYER_INFOS[playerIdx] = playerInfo
      socket.broadcast.emit(EVENT_NAME.player.move, data)
    }
  })

  // rotate
  // @todo refactor cause it has the same behavior
  socket.on(EVENT_NAME.player.rotate, function (data) {
    const playerInfo = data.playerInfo
    const playerIdx = getPlayerInfoIndexById(playerInfo.id)

    if (playerIdx > -1) {
      PLAYER_INFOS[playerIdx] = playerInfo
      socket.broadcast.emit(EVENT_NAME.player.rotate, data)
    }
  })

  // fire
  // @todo refactor cause it has the same behavior
  socket.on(EVENT_NAME.player.fire, function (data) {
    const playerInfo = data.playerInfo
    const playerIdx = getPlayerInfoIndexById(playerInfo.id)

    if (playerIdx > -1) {
      PLAYER_INFOS[playerIdx] = playerInfo
      socket.broadcast.emit(EVENT_NAME.player.fire, data)
    }
  })

  // is damaged
  // @todo refactor cause it has the same behavior
  socket.on(EVENT_NAME.player.isDamaged, function (data) {
    const playerInfo = data.playerInfo
    const playerIdx = getPlayerInfoIndexById(playerInfo.id)

    if (playerIdx > -1) {
      PLAYER_INFOS[playerIdx] = playerInfo

      IO.sockets.connected[socketId].emit(EVENT_NAME.player.isDamagedItSelf, data)
      socket.broadcast.emit(EVENT_NAME.player.isDamaged, data)
    }
  })

  // is recovered
  // @todo refactor cause it has the same behavior
  socket.on(EVENT_NAME.player.isRecovered, function (data) {
    const playerInfo = data.playerInfo
    const playerIdx = getPlayerInfoIndexById(playerInfo.id)

    if (playerIdx > -1) {
      PLAYER_INFOS[playerIdx] = playerInfo

      IO.sockets.connected[socketId].emit(EVENT_NAME.player.isRecoveredItSelf, data)
      socket.broadcast.emit(EVENT_NAME.player.isRecovered, data)
    }
  })

  // is died
  // @todo refactor cause it has the same behavior
  socket.on(EVENT_NAME.player.isDied, function (data) {
    let playerInfo = data.playerInfo
    const playerIdx = getPlayerInfoIndexById(playerInfo.id)

    if (playerIdx > -1) {
      // die event
      IO.sockets.connected[socketId].emit(EVENT_NAME.player.isDiedItSelf, data)
      socket.broadcast.emit(EVENT_NAME.player.isDied, data)

      // reset player info
      const newStartVector = getRandomStartCreatureVector()
      playerInfo = resetCreatureInfo(playerInfo, newStartVector)

      // update server data
      PLAYER_INFOS[playerIdx] = playerInfo

      // send data
      const newData = {
        playerInfo: playerInfo
      }
      IO.sockets.connected[socketId].emit(EVENT_NAME.player.isRespawnItSelf, newData)
      socket.broadcast.emit(EVENT_NAME.player.isRespawn, newData)
    }
  })

  // attack - zombie
  // @todo refactor
  socket.on(EVENT_NAME.player.attackZombie, function (data) {
    const monsterInfo = data.monsterInfo
    const monsterIdx = getMonsterInfoIndex(monsterInfo.id, ZOMBIE_INFOS)

    if (monsterIdx > -1) {
      ZOMBIE_INFOS[monsterIdx] = monsterInfo

      IO.emit(EVENT_NAME.player.attackZombie, data)
    }
  })

  // attack - machine
  // @todo refactor
  socket.on(EVENT_NAME.player.attackMachine, function (data) {
    const monsterInfo = data.monsterInfo
    const monsterIdx = getMonsterInfoIndex(monsterInfo.id, MACHINE_INFOS)

    if (monsterIdx > -1) {
      MACHINE_INFOS[monsterIdx] = monsterInfo

      IO.emit(EVENT_NAME.player.attackMachine, data)
    }
  })

  // attack - bat
  // @todo refactor
  socket.on(EVENT_NAME.player.attackBat, function (data) {
    const monsterInfo = data.monsterInfo
    const monsterIdx = getMonsterInfoIndex(monsterInfo.id, BAT_INFOS)

    if (monsterIdx > -1) {
      BAT_INFOS[monsterIdx] = monsterInfo

      IO.emit(EVENT_NAME.player.attackBat, data)
    }
  })

  // kill - zombie
  // @todo refactor
  socket.on(EVENT_NAME.player.killZombie, function (data) {
    let monsterInfo = data.monsterInfo
    const monsterIdx = getMonsterInfoIndex(monsterInfo.id, ZOMBIE_INFOS)

    if (monsterIdx > -1) {
      // die event
      IO.emit(EVENT_NAME.player.killZombie, data)

      // reset monster info
      var newStartVector = getRandomStartCreatureVector()
      monsterInfo = resetCreatureInfo(monsterInfo, newStartVector)

      // update server data
      ZOMBIE_INFOS[monsterIdx] = monsterInfo

      // send data
      // @todo check, we need this object ?
      const newData = { // eslint-disable-line
        monsterInfo: monsterInfo
      }
      IO.emit(EVENT_NAME.player.respawnZombie, data)
    }
  })

  // kill - machine
  // @todo refactor
  socket.on(EVENT_NAME.player.killMachine, function (data) {
    let monsterInfo = data.monsterInfo
    const monsterIdx = getMonsterInfoIndex(monsterInfo.id, MACHINE_INFOS)

    if (monsterIdx > -1) {
      // die event
      IO.emit(EVENT_NAME.player.killMachine, data)

      // reset monster info
      const newStartVector = getRandomStartCreatureVector()
      monsterInfo = resetCreatureInfo(monsterInfo, newStartVector)

      // update server data
      MACHINE_INFOS[monsterIdx] = monsterInfo

      // send data
      // @todo check, we need this object ?
      const newData = { // eslint-disable-line
        monsterInfo: monsterInfo
      }
      IO.emit(EVENT_NAME.player.respawnMachine, data)
    }
  })

  // kill - bat
  // @todo refactor
  socket.on(EVENT_NAME.player.killBat, function (data) {
    let monsterInfo = data.monsterInfo
    const monsterIdx = getMonsterInfoIndex(monsterInfo.id, BAT_INFOS)

    if (monsterIdx > -1) {
      // die event
      IO.emit(EVENT_NAME.player.killBat, data)

      // reset monster info
      const newStartVector = getRandomStartCreatureVector()
      monsterInfo = resetCreatureInfo(monsterInfo, newStartVector)

      // update server data
      BAT_INFOS[monsterIdx] = monsterInfo

      // send data
      // @todo check, we need this object ?
      const newData = { // eslint-disable-line
        monsterInfo: monsterInfo
      }
      IO.emit(EVENT_NAME.player.respawnBat, data)
    }
  })

  // attack - enemy
  socket.on(EVENT_NAME.player.attackEnemy, function (data) {
    const playerInfo = data.playerInfo
    const playerIdx = getPlayerInfoIndexById(playerInfo.id)

    if (playerIdx > -1) {
      PLAYER_INFOS[playerIdx] = playerInfo

      IO.emit(EVENT_NAME.player.attackEnemy, data)
    }
  })

  // kill - enemy
  // is died
  socket.on(EVENT_NAME.player.killEnemy, function (data) {
    let playerInfo = data.playerInfo
    const playerIdx = getPlayerInfoIndexById(playerInfo.id)

    if (playerIdx > -1) {
      // die event
      IO.emit(EVENT_NAME.player.killEnemy, data)

      // reset player info
      var newStartVector = getRandomStartCreatureVector()
      playerInfo = resetCreatureInfo(playerInfo, newStartVector)

      // update server data
      PLAYER_INFOS[playerIdx] = playerInfo

      // send data
      // @todo check, we need this object ?
      const newData = { // eslint-disable-line
        playerInfo: playerInfo
      }
      IO.emit(EVENT_NAME.player.respawnEnemy, data)
    }
  })
})

/* ================================================================ Log / Report
 */

/**
 * Report number of current connection
 */
function reportNumberOfConnections () { // eslint-disable-line
  var n = getNumberOfConnection()
  UTIL.serverLog('Players (n)', n)
}

/* ================================================================ Update
 */

/**
 * Get nearest player
 *
 * @param {CreatureInfo} monsterInfo
 * @param {number} visibleRange
 * @returns {Object}
 */
function getNearestPlayer (monsterInfo, visibleRange) {
  const nPlayers = PLAYER_INFOS.length
  let nearestPlayerDistance = 9000 // hack (must to bigger more than map size)
  let nearestPlayerVector = {}
  let data = {}
  let playerInfo

  for (let i = 0; i < nPlayers; i++) {
    playerInfo = PLAYER_INFOS[i]
    const distance = UTIL.getDistanceBetween(monsterInfo.lastVector, playerInfo.lastVector)

    if (distance <= visibleRange && distance < nearestPlayerDistance) {
      nearestPlayerDistance = distance
      nearestPlayerVector = playerInfo.lastVector
    }
  }

  if (!UTIL.isEmptyObject(nearestPlayerVector)) {
    data = {
      monsterInfo: monsterInfo,
      targetCreatureId: playerInfo.id,
      targetVector: nearestPlayerVector
    }
  }

  return data
}

/**
 * Update zombie position
 * @todo complete it
 */
function updateZombie () {

}

/**
 * Update machine monster event
 * due to machine cannot move
 * so, it will fire `fire` event only
 */
function updateMachine () {
  const visibleRange = 336
  const nMachines = MACHINE_INFOS.length
  const nPlayers = PLAYER_INFOS.length
  let dataArr = []

  if (nPlayers > 0) {
    // @todo refactor
    for (let i = 0; i < nMachines; i++) {
      const monsterInfo = MACHINE_INFOS[i]
      const data = getNearestPlayer(monsterInfo, visibleRange)

      if (!UTIL.isEmptyObject(data)) {
        dataArr.push(data)
      }
    }
  }

  if (!UTIL.isEmpty(dataArr)) {
    IO.emit(EVENT_NAME.server.machineFire, dataArr)
  }
}

/**
 * Update bat
 * based on `updateZombie`
 * @todo complete it
 */
function updateBat () {

}

/* ================================================================ Interval
 */

setInterval(function () {
  // reportNumberOfConnections();

  updateZombie()
  updateMachine()
  updateBat()
}, SERVER_HEARTBEAT)
