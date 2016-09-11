// Super class
// - info
// - phs
// - latestPosition
var Hero = function(playerInfo, spriteName) {
  if (spriteName === undefined) spriteName = 'hero';

  this.spriteName = spriteName;
  this.phs = {};
  this.info = playerInfo;
  this.latestPosition = {
    x: playerInfo.x,
    y: playerInfo.y,
    angle: playerInfo.angle,
  };

  this.init();
};

Hero.prototype.init = function() {
  this.phs = GAME.add.sprite(this.info.x, this.info.y, this.spriteName);
  this.phs.animations.add('move', [0, 1, 2, 3, 4, 5, 6, 7], 20, true);
  this.phs.animations.add('stop', [3], 20, true);
  this.phs.anchor.setTo(0.5, 0.5)

  // more (unsed)
  this.info.health = 3;
  this.info.alive = true;

  // GAME.physics.p2.enable(this.phs);
  GAME.physics.arcade.enable(this.phs);
  this.phs.body.immovable = true;
  this.phs.body.collideWorldBounds = true;
  this.phs.angle = this.info.angle;
  this.phs.body.velocity.x = 0;
  this.phs.body.velocity.y = 0;
}

Hero.prototype.getPosition = function() {
  return {
    x: this.phs.x,
    y: this.phs.y,
    angle: this.phs.angle,
  }
}

Hero.prototype.updateLatestPosition = function() {
  this.latestPosition = this.getPosition();
}
