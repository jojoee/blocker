/**
 * Server entry file
 */

var EXPRESS = require('express'),
  APP = EXPRESS(),
  PATH = require('path'),
  FAKER = require('faker'),
  Hashids = require('hashids'),
  HASHIDS = new Hashids(),
  SHORTID = require('shortid'),
  SERVER = require('http').Server(APP),
  IO = require('socket.io')(SERVER),
  UTIL = require('./common/util'),
  CONFIG = require('./common/config'),
  SERVER_CONFIG = require('./server/config'),
  MODULE = require('./common/module'),
  SERVER_MODULE = require('./server/module'),
  Message = MODULE.Message;

var SERVER_PORT = CONFIG.serverPort,
  EVENT_NAME = CONFIG.eventName,
  STATIC_PATH = PATH.join(__dirname + '/public'),
  COMMON_PATH = PATH.join(__dirname + '/common'),
  SERVER_HEARTBEAT = 100,
  GAME_WORLD_WIDTH = CONFIG.game.worldWidth,
  MAP_HEIGHT = CONFIG.game.worldHeight,
  CHAT_LOGS = [],
  MAX_CHAT_LOGS = 256,
  IS_DEBUG = CONFIG.isDebug,
  IS_DUMMY = CONFIG.isDummy;

var PLAYERS = [];
// [ {Player1}, {Player2}, {Player3} ]

/*================================================================ App & Init
 */

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

if (IS_DUMMY) {
  dummyFakeChatLogs();
  dummyFakePlayers();
}

/*================================================================ Fake & Debug
 */

/**
 * Dummy fake chat logs
 * TODO: complete it
 */
function dummyFakeChatLogs() {

}

/**
 * Dummy fake players
 * TODO: complete it
 */
function dummyFakePlayers() {

}

/*================================================================ Socket UTIL
 */

/**
 * Get number of real players by checking io connection
 * (unused)
 *
 * @see http://stackoverflow.com/questions/10275667/socket-io-connected-user-count
 * 
 * @returns {number}
 */
function getNumberOfRealPlayer() {
  return IO.engine.clientsCount;
}

/*================================================================ Game
 */

/**
 * Add Message object to chat logs
 * 
 * @param {Message} message
 */
function addToChatLogs(message) {
  var nLogs = CHAT_LOGS.length;

  if (nLogs >= MAX_CHAT_LOGS) {
    CHAT_LOGS.shift();
  }

  CHAT_LOGS.push(message);
}

/**
 * Is duplicated id
 * TODO: complete it
 * 
 * @param {string} playerId
 * @returns {boolean}
 */
function isDuplicatedId(playerId) {
  var isDuplicated = false;

  return isDuplicated;
}

/**
 * Get unique player id
 * TODO: complete it
 * 
 * @returns {string}
 */
function getUniquePlayerId() {

}

/**
 * Get player index by id
 * TODO: complete it
 * 
 * @param {string} playerId
 * @returns {number} return integer number when it's found (return if not found)
 */
function getPlayerIndexById(playerId) {
  var isFound = false;

  if (!isFound) {
    UTIL.serverBugLog('getPlayerIndexById', 'Not found playerId', playerId);
  }

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
  return (getPlayerIndexById(playerId) > -1)
}

/**
 * Remove player out of PLAYERS
 * 
 * @param {string} playerId
 * @returns
 */
function removePlayer(playerId) {
  var playerIdx = getPlayerIndexById(playerId);

  if (playerIdx > -1) {
    PLAYERS.splice(playerIdx, 1);

    return true;
  }

  return false;
}

/**
 * Get bot players
 * TODO: complete it
 * 
 * @returns
 */
function getBotPlayers() {
  var bots;

  return bots;
}

/**
 * Get number of bot players
 * TODO: complete it
 * 
 * @returns {number}
 */
function getNumberOfBotPlayers() {
  var bots = getBotPlayers();

  return bots.length;
}

/**
 * Get real players
 * TODO: complete it
 * 
 * @returns
 */
function getRealPlayers() {
  var realPlayers = [];

  return realPlayers;
}

/**
 * Get number of real players
 * TODO: complete it
 * 
 * @returns
 */
function getNumberOfRealPlayers() {
  var realPlayers = getRealPlayers();

  return realPlayers.length;
}

/*================================================================ Socket
 */

IO.on('connection', function(socket) {
  var socketId = socket.id,
    playerId = getUniquePlayerId();

  UTIL.serverLog(playerId + ' is connect');

  // disconnect
  socket.on('disconnect', function() {
    UTIL.serverLog(playerId + ' is disconnect');

    // remove player
    removePlayer(playerId);

    // send disconnected player
    // TODO: complete it
    var data = {};
    socket.broadcast.emit(EVENT_NAME.server.disconnectedPlayer, data);
  });

  // ready
  socket.on(EVENT_NAME.player.ready, function() {

    // send data to new connection
    // - playerInfo
    // - existingPlayers
    // 
    // TODO: complete it
    var data = {};
    IO.sockets.connected[socketId].emit(EVENT_NAME.player.ready, data);

    // broadcast new player data
    // to existing players
    //
    // TODO: complete it
    var newPlayerData = {};
    socket.broadcast.emit(EVENT_NAME.server.newPlayer, newPlayerData);

    // add new player
    PLAYERS.push(newPlayerData);
  });

  // message
  // TODO: complete it
  socket.on(EVENT_NAME.player.message, function(player) {
    var playerIdx = getPlayerIndexById(playerId);

    if (isExistingPlayer(playerId)) {
      var data = {};
      IO.emit(EVENT_NAME.player.message, data);
    }
  });

  // typing
  // (quite duplicate with message)
  // TODO: complete it
  socket.on(EVENT_NAME.player.typing, function() {
    var playerIdx = getPlayerIndexById(playerId);

    if (isExistingPlayer(playerId)) {
      var data = {};
      socket.broadcast.emit(EVENT_NAME.player.typing, data);
    }
  });

  // move
  // TODO: complete it
  socket.on(EVENT_NAME.player.move, function(position) {
    var playerIdx = getPlayerIndexById(playerId);

    if (isExistingPlayer(playerId)) {
      var data = {};
      socket.broadcast.emit(EVENT_NAME.player.move, data);
    }
  });
});

/*================================================================ Log / Report
 */

function reportPlayers() {
  UTIL.serverLog('Players', PLAYERS);
}

function reportNumberOfPlayers() {
  UTIL.serverLog('Players', PLAYERS.length);
}

function reportBotPlayers() {
  UTIL.serverLog('Bots', getBotPlayers());
}

function reportNumberOfBotPlayers() {
  UTIL.serverLog('Bots', getNumberOfBotPlayers());
}

function reportRealPlayers() {
  UTIL.serverLog('Real PLAYERS', getRealPlayers());
}

function reportNumberOfRealPlayers() {
  UTIL.serverLog('Real PLAYERS', getNumberOfRealPlayers());
}

function reportNumberOfChatLogs() {
  UTIL.serverLog('Chat logs (number)', CHAT_LOGS.length);
}

function reportChatLogs() {
  reportNumberOfChatLogs();
  UTIL.serverLog('Chat logs', CHAT_LOGS);
}

/*================================================================ Interval
 */

setInterval(function() {
  // 
}, SERVER_HEARTBEAT);
