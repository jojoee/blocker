// player = client
// 
// `player` is something that interact by player (e.g. message)
// other else is `server` (e.g. existingPlayers, newPlayer)

var eventPlayerPrefix = 'player.',
  eventServerPrefix = 'server.';

var config = {
  eventName: {
    player: {
      // player send message
      message: eventPlayerPrefix + 'message',

      // player typing
      typing: eventPlayerPrefix + 'typing',

      // player move
      move: eventPlayerPrefix + 'move',
    },
    server: {
      // send player info
      playerInfo: eventServerPrefix + 'player info',

      // send existing players
      existingPlayers: eventServerPrefix + 'existing players',

      // send new player
      newPlayer: eventServerPrefix + 'new player',

      // send disconnected player
      disconnectedPlayer: eventServerPrefix + 'disconnected player',
    }
  }
};

if (typeof module !== 'undefined' && module.exports != null) {
  module.exports = {
    eventName: config.eventName
  }
}
