// unused
var Item = {

};

// TODO: refactor
var Creature = {
  hero: {
    blr: {
      visibleRange: 300,
    },
    blrInfo: new COMMON_MODULE.CreatureInfo(10),
    phrInfo: {
      speed: 200, // unsed
      angleSpeed: 200,
    },
    blrLastPos: {},
    blrLabel: {},
    blrShadow: {},
    blrWeapon: {},
    blrBullet: {},
  },
  zombie: {
    blr: {},
    blrInfo: new COMMON_MODULE.CreatureInfo(5, 8),
    phrInfo: {
      spriteName: 'zombie',
      width: 46,
      height: 46,
      bodyOffset: 6,
      bodyMass: -100,
    },
    blrLastPos: {},
    blrLabel: {},
    blrShadow: {},
    blrWeapon: {},
    blrBullet: {},
  },
  machine: {
    blr: {
      visibleRange: 300,
    },
    blrInfo: new COMMON_MODULE.CreatureInfo(5),
    phrInfo: {
      spriteName: 'machine',
      width: 46,
      height: 46,
      bodyOffset: 6,
      bodyMass: -100,
    },
    blrLastPos: {},
    blrLabel: {},
    blrShadow: {},
    blrWeapon: {},
    blrBullet: {},
  },
  bat: {
    blr: {},
    blrInfo: new COMMON_MODULE.CreatureInfo(3),
    phrInfo: {
      spriteName: 'bat',
      width: 46,
      height: 46,
      bodyOffset: 8,
      bodyMass: 0,
    },
    blrLastPos: {},
    blrLabel: {},
    blrShadow: {},
    blrWeapon: {},
    blrBullet: {},
  },
};

module.exports = {
  Item: Item,
  Creature: Creature
};
