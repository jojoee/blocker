/**
 * Server entry file
 */

var EXPRESS = require('express'),
  APP = EXPRESS(),
  PATH = require('path'),
  SHORTID = require('shortid'),
  SERVER = require('http').Server(APP),
  IO = require('socket.io')(SERVER),
  UTIL = require('./common/util'),
  CONFIG = require('./common/config'),
  SERVER_CONFIG = require('./server/config'),
  mapJson = require('./public/src/asset/image/map.json'),
  VTMAP = {},
  MODULE = require('./common/module'),
  SERVER_MODULE = require('./server/module'),
  Message = MODULE.Message,
  Vector = MODULE.Vector,
  Position = MODULE.Position,
  CreatureInfo = MODULE.CreatureInfo;

var SERVER_PORT = CONFIG.serverPort,
  EVENT_NAME = CONFIG.eventName,
  STATIC_PATH = PATH.join(__dirname + '/public'),
  COMMON_PATH = PATH.join(__dirname + '/common'),
  SERVER_HEARTBEAT = 100,
  IS_DEBUG = CONFIG.isDebug;

/** @type {Array.CreatureInfo} */
var ZOMBIE_INFOS = [];

/** @type {Array.CreatureInfo} */
var MACHINE_INFOS = [];

/** @type {Array.CreatureInfo} */
var BAT_INFOS = [];

/** @type {Array.CreatureInfo} */
var PLAYER_INFOS = [];

/*================================================================ App & Init
 */

initVirtualMap();
initMonsters();

// Set static file
APP.use('/public', EXPRESS.static(STATIC_PATH));
APP.use('/common', EXPRESS.static(COMMON_PATH));

APP.get('/', function(req, res) {
  res.sendFile(STATIC_PATH + '/index.html');
});

SERVER.listen(SERVER_PORT, function(err) {
  if (err) {
    throw err;

  } else {
    UTIL.serverLog('Listening on port: ' + SERVER_PORT);
  }
});

/*================================================================ Socket UTIL
 */

/**
 * Get number of client connection by checking io connection
 *
 * @see http://stackoverflow.com/questions/10275667/socket-io-connected-user-count
 * 
 * @returns {number}
 */
function getNumberOfConnection() {
  return IO.engine.clientsCount;
}

/*================================================================ Init
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
function initVirtualMap() {
  // VTMAP
  VTMAP.mapTileWidth = mapJson.tilewidth;
  VTMAP.mapTileHeight = mapJson.tileheight;
  VTMAP.nTileWidth = mapJson.width;
  VTMAP.nTileHeight = mapJson.height;
  VTMAP.data = UTIL.creature2DArray(
    VTMAP.nTileWidth,
    VTMAP.nTileHeight,
    0
  );

  var i = 0,
    n = VTMAP.nTileWidth * VTMAP.nTileHeight;

  // row
  for (i = 0; i < VTMAP.nTileHeight; i++) {
    // column
    for (j = 0; j < VTMAP.nTileWidth; j++) {
      var idx = i * VTMAP.nTileWidth + j;

      // floor
      var tmp1 = mapJson.layers[0].data[idx];
      if (tmp1 === 5 || tmp1 === 6) VTMAP.data[i][j] = tmp1; 

      // stone
      var tmp2 = mapJson.layers[1].data[idx];
      if (tmp2 === 1 || tmp2 === 3) VTMAP.data[i][j] = tmp2;
    }
  }
}

/**
 * Initial monster
 * - zombie
 * - machine
 * - bat
 */
function initMonsters() {
  var nZombies = 8,
    nMachines = 8,
    nBats = 8,
    i = 0;

  for (i = 0; i < nZombies; i++) {
    var creatureInfo = getNewZombieInfo();
    ZOMBIE_INFOS.push(creatureInfo);
  }

  for (i = 0; i < nMachines; i++) {
    var creatureInfo = getNewMachineInfo();
    MACHINE_INFOS.push(creatureInfo);
  }

  for (i = 0; i < nBats; i++) {
    var creatureInfo = getNewBatInfo();
    BAT_INFOS.push(creatureInfo);
  }
}

function getNewZombieInfo() {
  return getNewCreatureInfo('zombie', 5, 8);
}

function getNewMachineInfo() {
  return getNewCreatureInfo('machine', 5, 5);
}

function getNewBatInfo() {
  return getNewCreatureInfo('bat', 3, 3);
}

function getNewPlayerInfo() {
  return getNewCreatureInfo('hero', 8, 8);
}

/**
 * Get new creature info
 * 
 * @param {string} type
 * @param {number} life
 * @param {number} maxLife
 * @returns {CreatureInfo}
 */
function getNewCreatureInfo(type, life, maxLife) {
  var creatureId = getUniqueCreatureId(),
    startPosition = getRandomStartCreaturePosition();

  var startRotation = getRandomRotation(), 
    startVector = new Vector(startPosition.x, startPosition.y, startRotation),
    creatureInfo = new CreatureInfo(creatureId, type, startVector, life, maxLife);

  return creatureInfo;
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
function getRandomStartCreaturePosition() {
  return getCreaturePositionByExclusion([1, 3, 5, 6]);
}

/**
 * Get random rotation
 * 
 * @returns {number} rotation (float)
 */
function getRandomRotation() {
  return UTIL.getRandomArbitrary(-Math.PI, Math.PI);
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
function getCreaturePositionByExclusion(arr) {
  var nTileWidth = VTMAP.nTileWidth,
    nTileHeight = VTMAP.nTileHeight,
    tileWidth = VTMAP.mapTileWidth,
    tileHeight = VTMAP.mapTileHeight;

  var tileIndexX,
    tileIndexY,
    isNotOk = true;

  while (isNotOk) {
    tileIndexX = UTIL.getRandomInt(0, nTileWidth - 1);
    tileIndexY = UTIL.getRandomInt(0, nTileHeight - 1);

    // if the tile value is not be contained in
    if (arr.indexOf(VTMAP.data[tileIndexY][tileIndexX]) === -1) {
      isNotOk = false;
    }
  }

  // we got point (0, 0) of the tile
  // so we need to convert it to middle point of this tile
  var zeroPos = convertTileIndexToPoint(tileIndexX, tileIndexY),
    midelPos = new Position(zeroPos.x + tileWidth / 2, zeroPos.y + tileHeight / 2);

  return midelPos;
}

/**
 * Convert tile index to point (0, 0)
 * 
 * @param {number} tileIndexX - index of tile x
 * @param {number} tileIndexY - index of tile y
 * 
 * @returns {Position} return position of tile at (0, 0) 
 */
function convertTileIndexToPoint(tileIndexX, tileIndexY) {
  var x = tileIndexX * VTMAP.mapTileWidth,
    y = tileIndexY * VTMAP.mapTileHeight,
    result = new Position(x, y);

  return result;
}

/*================================================================ Game
 */

function isDuplicateCreatureId(creatureid, creatureInfos) {
  var i = 0,
    isDuplicated = false,
    n = creatureInfos.length;

  for (i = 0; i < n; i++) {
    var creatureInfo = creatureInfos[i];

    if (creatureInfo.id == creatureid) {
      isDuplicated = true;
      break;
    }
  }

  return isDuplicated;
}

/**
 * Get unique creature id
 * 
 * @returns {string}
 */
function getUniqueCreatureId() {
  var creatureId,
    isDuplicated = true;

  while (isDuplicated) {
    creatureId = SHORTID.generate();
    
    if (!isDuplicateCreatureId(creatureId, ZOMBIE_INFOS) &&
      !isDuplicateCreatureId(creatureId, MACHINE_INFOS) &&
      !isDuplicateCreatureId(creatureId, BAT_INFOS) &&
      !isDuplicateCreatureId(creatureId, PLAYER_INFOS)) {
      isDuplicated = false;
    }
  }

  return creatureId;
}

/**
 * Get playerInfo index by id
 * 
 * @param {string} playerId
 * @returns {number} return integer number when it's found (return -1, if not found)
 */
function getPlayerInfoIndexById(playerId) {
  var i = 0;
    nPlayers = PLAYER_INFOS.length,
    isFound = false;

  for (i = 0; i < nPlayers; i++) {
    if (PLAYER_INFOS[i].id == playerId) {
      return i;
    }
  }

  util.serverBugLog('getPlayerInfoIndexById', 'Not found playerId', playerId);

  return -1;
}

/**
 * Check this player is already
 * exists in the server 
 * 
 * @param {string} playerId
 * @returns {boolean}
 */
function isExistingPlayer(playerId) {
  return (getPlayerInfoIndexById(playerId) > -1)
}

/**
 * Remove player out of PLAYER_INFOS
 * 
 * @param {string} playerId
 * @returns
 */
function removePlayer(playerId) {
  var playerIdx = getPlayerInfoIndexById(playerId);

  if (playerIdx > -1) {
    PLAYER_INFOS.splice(playerIdx, 1);

    return true;
  }

  return false;
}

/*================================================================ Socket
 */

IO.on('connection', function(socket) {
  var socketId = socket.id,
    playerInfo = getNewPlayerInfo();

  UTIL.serverLog(playerInfo.id + ' is connect');

  // disconnect
  socket.on('disconnect', function() {
    UTIL.serverLog(playerInfo.id + ' is disconnect');

    // remove player
    removePlayer(playerInfo.id);

    // send disconnected player
    var data = {
      playerInfo: playerInfo
    };
    socket.broadcast.emit(EVENT_NAME.server.disconnectedPlayer, data);
  });

  // ready
  socket.on(EVENT_NAME.player.ready, function() {
    
    // data for new player
    var data = {
      VTMap: VTMAP,
      playerInfo: playerInfo,
      existingPlayerInfo: PLAYER_INFOS,
      zombieInfos: ZOMBIE_INFOS,
      machineInfos: MACHINE_INFOS,
      batInfos: BAT_INFOS,
    };
    IO.sockets.connected[socketId].emit(EVENT_NAME.player.ready, data);

    // add new player
    PLAYER_INFOS.push(playerInfo);

    // broadcast new player data
    // to existing players
    var data = {
      playerInfo: playerInfo,
    };
    socket.broadcast.emit(EVENT_NAME.server.newPlayer, data);
  });

  // message
  // TODO: complete it
  socket.on(EVENT_NAME.player.message, function(player) {
    var playerIdx = getPlayerInfoIndexById(playerId);

    if (isExistingPlayer(playerId)) {
      var data = {};
      IO.emit(EVENT_NAME.player.message, data);
    }
  });

  // move
  // TODO: complete it
  socket.on(EVENT_NAME.player.move, function(position) {
    var playerIdx = getPlayerInfoIndexById(playerId);

    if (isExistingPlayer(playerId)) {
      var data = {};
      socket.broadcast.emit(EVENT_NAME.player.move, data);
    }
  });
});

/*================================================================ Log / Report
 */

function reportNumberOfConnections() {
  var n = getNumberOfConnection();
  UTIL.serverLog('Players (n)', n);
}

/*================================================================ Interval
 */

/*
setInterval(function() {
  reportNumberOfConnections();

}, SERVER_HEARTBEAT);
*/
