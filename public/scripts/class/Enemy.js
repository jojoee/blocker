var Enemy = function(playerInfo) {
  Hero.call(this, playerInfo, 'enemy');
};

Enemy.prototype = Object.create(Hero.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function () {
  if (this.isMove()) {
    this.phs.play('move');

    this.phs.x = this.info.x;
    this.phs.y = this.info.y;
    this.phs.angle = this.info.angle;
    this.updateInfo();

  } else {
    this.phs.play('stop');
  }
}

Hero.prototype.isMove = function() {
  if (this.phs.x === this.latestPosition.x &&
    this.phs.y === this.latestPosition.y) {
    this.phs.play('stop');

  } else {
    this.phs.play('move');
    // this.phs.rotation = Math.PI + GAME.physics.arcade.angleToXY(this.phs, this.latestPosition.x, this.latestPosition.y);
  }

  this.updateLatestPosition();
}
