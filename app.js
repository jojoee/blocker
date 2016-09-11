// import
var express = require('express'),
  app = express(),
  path = require('path'),
  faker = require('faker'),
  server = require('http').Server(app),
  io = require('socket.io')(server),
  commonConfig = require('./common/config'),
  util = require('./common/util'),
  serverConfig = require('./server/config'), // unused
  shortid = require('shortid'),
  Player = require('./server/Player');

// var
var port = commonConfig.serverPort,
  eventName = commonConfig.eventName,
  staticPath = path.join(__dirname + '/public'),
  commonPath = path.join(__dirname + '/common'),
  serverHeartbeat = 50,
  mapWidth = commonConfig.game.worldWidth,
  mapHeight = commonConfig.game.worldHeight,
  chatLogs = [],
  maxChatLogs = 256,
  isDebug = false;

var players = [];
// [ {Player1}, {Player2}, {Player3} ]

// Debug & testing
// should be removed when deploy
// isDebug = true; // unused

generateFakeChatLogs();
generateFakePlayers();

/*================================================================ Fake & Debug
*/

function generateFakeChatLogs() {
  var i = 0,
    nMessage = 12;

  for (i = 0; i < nMessage; i++) {
    var playerId = shortid.generate(),
      player = new Player(playerId),
      message = faker.lorem.sentence();

    player.setMessage(message);
    player.updateLatestUpdate();

    addToChatLogs(player);
  }
}

function generateFakePlayers() {
  var i = 0,
    nPlayers = 8;

  for (i = 0; i < nPlayers; i++) {
    var playerId = getUniquePlayerId(),
      player = new Player(playerId, 'bot');

    players.push(player);
  }
}

/*================================================================ Fake & Debug - move bot
*/

function getRandomWalkPosition(oldPosition) {
  var step = 10,
    newPosition = {
      x: oldPosition.x + util.getRandomInt(-step, step),
      y: oldPosition.y + util.getRandomInt(-step, step),
    };

  if (newPosition.x < 0) {
    newPosition.x = 0;

  } else if (newPosition.x > mapWidth) {
    newPosition.x = mapWidth;
  }

  if (newPosition.x < 0) {
    newPosition.x = 0;
    
  } else if (newPosition.x > mapHeight) {
    newPosition.x = mapHeight;
  }

  return newPosition;
}

function moveBotPlayers() {
  var i = 0,
    nPlayers = players.length;

  for (i = 0; i < nPlayers; i++) {
    if (players[i].getPlayerType() === 'bot') {
      var oldPosition = players[i].getPosition(),
        newPosition = getRandomWalkPosition(oldPosition);

      players[i].updatePosition(newPosition);
      players[i].updateLatestUpdate();

      io.emit(eventName.player.move, players[i]);
    }
  }
}

/*================================================================ Socket util
*/

// unused
// http://stackoverflow.com/questions/10275667/socket-io-connected-user-count
function getNumberOfRealPlayer() {
  return io.engine.clientsCount;
}

/*================================================================ Game
*/

function addToChatLogs(player) {
  var nLogs = chatLogs.length;

  if (nLogs >= maxChatLogs) {
    chatLogs.shift();
  }

  chatLogs.push(player);
}

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

function getUniquePlayerId() {
  var playerId,
    isDuplicated = true;

  while (isDuplicated) {
    playerId = shortid.generate();
    isDuplicated = isDuplicatedId(playerId);
  }

  return playerId;
}

function getPlayerIndexById(playerId) {
 var i = 0;
    nPlayers = players.length,
    isFound = false;

  for (i = 0; i < nPlayers; i++) {
    if (players[i].playerId == playerId) {
      return i;
    }
  }

  util.serverBugLog('getPlayerIndexById', 'Not found playerId', playerId);

  return -1;
}

function removePlayer(playerId) {
  var playerIdx = getPlayerIndexById(playerId);

  if (playerIdx > -1) {
    players.splice(playerIdx, 1);

    return true;
  }

  return false;
}

function getBotPlayers() {
  var i = 0,
    nPlayers = players.length,
    bots = [];

  for (i = 0; i < nPlayers; i++) {
    if (players[i].getPlayerType() === 'bot') {
      bots.push(players[i]);
    }
  }

  return bots;
}

function getNumberOfBotPlayers() {
  var bots = getBotPlayers();

  return bots.length;
}

function getRealPlayers() {
  var i = 0,
    nPlayers = players.length,
    realPlayers = [];

  for (i = 0; i < nPlayers; i++) {
    if (players[i].getPlayerType() === 'player') {
      realPlayers.push(players[i]);
    }
  }

  return realPlayers;
}

function getNumberOfRealPlayers() {
  var realPlayers = getRealPlayers();

  return realPlayers.length;
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
    util.serverLog('Listening on port: ' + port);
  }
});

/*================================================================ Socket
*/

io.on('connection', function(socket) {
  var socketId = socket.id,
    playerId = getUniquePlayerId(),
    player = new Player(playerId);

  util.serverLog(playerId + ' is connect');

  // disconnect
  socket.on('disconnect', function() {
    util.serverLog(playerId + ' is disconnect');

    // remove player
    removePlayer(playerId);

    // send disconnected player
    socket.broadcast.emit(eventName.server.disconnectedPlayer, player);
  });

  // ready
  socket.on(eventName.player.ready, function() {
    // send playerInfo and existingPlayers
    io.sockets.connected[socketId].emit(eventName.player.ready, {
      playerInfo: player,
      existingPlayerInfos: players,
      existingChatLogs: chatLogs,
    });

    // broadcast to existing players
    // about new player
    socket.broadcast.emit(eventName.server.newPlayer, player);

    // add new player
    players.push(player);
  });

  // message
  socket.on(eventName.player.message, function(player) {
    var playerIdx = getPlayerIndexById(playerId);

    if (playerIdx > -1) {
      players[playerIdx].setMessage(player.message);
      players[playerIdx].updateLatestUpdate();
      addToChatLogs(players[playerIdx]);
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

  // move
  socket.on(eventName.player.move, function(position) {
    var playerIdx = getPlayerIndexById(playerId);

    if (playerIdx > -1) {
      players[playerIdx].updatePosition(position);
      players[playerIdx].updateLatestUpdate();

      socket.broadcast.emit(eventName.player.move, players[playerIdx]);
    }
  });
});

/*================================================================ Log / Report
*/

function reportPlayers() {
  util.serverLog('Players', players);
}

function reportNumberOfPlayers() {
  util.serverLog('Players', players.length);
}

function reportBotPlayers() {
  util.serverLog('Bots', getBotPlayers());
}

function reportNumberOfBotPlayers() {
  util.serverLog('Bots', getNumberOfBotPlayers());
}

function reportRealPlayers() {
  util.serverLog('Real players', getRealPlayers());
}

function reportNumberOfRealPlayers() {
  util.serverLog('Real players', getNumberOfRealPlayers());
}

function reportNumberOfChatLogs() {
  util.serverLog('Chat logs (number)', chatLogs.length);
}

function reportChatLogs() {
  reportNumberOfChatLogs();
  util.serverLog('Chat logs', chatLogs);
}

/*================================================================ Interval
*/

setInterval(function() {
  moveBotPlayers();

  // console.log('--------------------------------');

  // reportPlayers();
  // reportBotPlayers();
  // reportRealPlayers();
  // reportChatLogs();

  // reportNumberOfPlayers();
  // reportNumberOfBotPlayers();
  // reportNumberOfRealPlayers();
  // reportNumberOfChatLogs();

}, serverHeartbeat);
