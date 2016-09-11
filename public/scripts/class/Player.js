var Player = function(playerInfo) {
  Hero.call(this, playerInfo, 'player');
};

Player.prototype = Object.create(Hero.prototype);
Player.prototype.constructor = Player;
