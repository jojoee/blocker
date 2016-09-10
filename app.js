// import
var express = require('express'),
  app = express(),
  path = require('path'),
  server = require('http').Server(app),
  io = require('socket.io')(server),
  commonConfig = require('./common/config'),
  util = require('./common/util'),
  serverConfig = require('./server/config'),
  shortid = require('shortid'),
  Player = require('./server/Player');

// var
var port = serverConfig.port,
  eventName = commonConfig.eventName,
  staticPath = path.join(__dirname + '/public'),
  commonPath = path.join(__dirname + '/common'),
  serverHeartbeat = 3000,
  mapWidth = 800,
  chatLogs = []; // 256
  mapHeight = 600;

var players = [];
// [ {Player1}, {Player2}, {Player3} ]

/*================================================================ Util
*/

function serverLog(title, data) {
  var text = 'Server: ' + title;

  appLog(text, data);
}

function clientLog(title, data) {
  var text = 'Player: ' + title;

  appLog(text, data);
}

// bug log
function bugLog(data) {
  serverLog('BUG', data);
}

function appLog(text, data) {
  var text = util.getCurrentUtcTimestamp() + text;

  if (data === undefined) {
    data = '';
  }

  console.log(text, data);
}

/*================================================================ Socket util
*/

// http://stackoverflow.com/questions/10275667/socket-io-connected-user-count
function getCurrentOnlinePlayer() {
  return io.engine.clientsCount;
}

/*================================================================ Game
*/

// global
// - players
function isDuplicatedId(playerId) {
  var i = 0;
    nPlayers = players.length,
    isDuplicated = false;

  for (i = 0; i < nPlayers; i++) {
    var c = players[i];

    if (c.playerId == playerId) {
      isDuplicated = true;
      break;
    }
  }

  return isDuplicated;
}

// global
// - players (isDuplicatedId)
function getUniquePlayerId() {
  var playerId,
    isDuplicated = true;

  while (isDuplicated) {
    playerId = shortid.generate();
    isDuplicated = isDuplicatedId(playerId);
  }

  return playerId;
}

// global
// - players
function addPlayer(playerId) {
  players.push(playerId);
}

// global
// - players
// 
// TODO: Refactor (returned value when not found)
// TODO: Error system
function getPlayerIndexById(playerId) {
 var i = 0;
    nPlayers = players.length,
    isFound = false;

  for (i = 0; i < nPlayers; i++) {
    if (players[i].playerId == playerId) {
      return i;
    }
  }

  bugLog('getPlayerIndexById: not found ' + playerId);

  return -1;
}

// global
// - players
function removePlayer(playerId) {
  var playerIdx = getPlayerIndexById(playerId);

  if (playerIdx > -1) {
    players.splice(playerIdx, 1);

    return true;
  }

  return false;
}

/*================================================================ App
*/

// Set static file
app.use('/public', express.static(staticPath));
app.use('/common', express.static(commonPath));

app.get('/', function(req, res) {
  res.sendFile(staticPath + '/index.html');
});

server.listen(port, function(err) {
  if (err) {
    throw err;
    
  } else {
    console.log('Listening on port: ' + port);
  }
});

/*================================================================ Socket
*/

io.on('connection', function(socket) {
  var socketId = socket.id,
    playerId = getUniquePlayerId(),
    playerX = util.getRandomInt(0, mapWidth),
    playerY = util.getRandomInt(0, mapHeight),
    playerAngle = util.getRandomInt(0, 360),
    player = new Player(playerId, playerX, playerY, playerAngle);

  clientLog(playerId, 'is connect');

  // send existing players
  // to this player
  io.sockets.connected[socketId].emit(eventName.server.existingPlayers, players);

  // add new player
  players.push(player);

  // send player id to player
  io.sockets.connected[socketId].emit(eventName.server.playerInfo, player);

  // broadcast to existing players
  // about new player
  socket.broadcast.emit(eventName.server.newPlayer, player);

  // disconnect
  socket.on('disconnect', function() {
    clientLog(playerId, 'is disconnect');

    // remove player
    removePlayer(playerId);

    // send disconnected player
    socket.broadcast.emit(eventName.server.disconnectedPlayer, player);
  });

  // move
  socket.on(eventName.player.move, function(player) {
    var playerIdx = getPlayerIndexById(playerId);

    if (playerIdx > -1) {
      players[playerIdx].setX(player.x);
      players[playerIdx].setY(player.y);
      players[playerIdx].setAngle(player.angle);

      socket.broadcast.emit(eventName.player.move, players[playerIdx]);
    }
  });

  // message
  socket.on(eventName.player.message, function(player) {
    var playerIdx = getPlayerIndexById(playerId);
    console.log(player);

    if (playerIdx > -1) {
      players[playerIdx].setMessage(player.message);
      io.emit(eventName.player.message, players[playerIdx]);
    }
  });

  // typing
  // (quite duplicate with message)
  socket.on(eventName.player.typing, function() {
    var playerIdx = getPlayerIndexById(playerId);

    if (playerIdx > -1) {
      players[playerIdx].updateLatestTyping();
      socket.broadcast.emit(eventName.player.typing, players[playerIdx]);
    }
  });
});

//================================================================

function reportNumberOfCurrentOnlinePlayer() {
  var onlinePlayer = getCurrentOnlinePlayer();
  var text = 'Online player (number)';

  serverLog(text, onlinePlayer);
}

function reportCurrentOnlinePlayer() {
  var text = 'Online player';

  serverLog(text, players);
}

setInterval(function() {
  reportNumberOfCurrentOnlinePlayer();
  // reportCurrentOnlinePlayer();
}, serverHeartbeat);
