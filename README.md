# Blocker
[![Build Status](https://travis-ci.org/jojoee/blocker.svg)](https://travis-ci.org/jojoee/blocker)

Multiplayer online game using Phaser + WebSocket (Socket.IO).

## Control
```
1. Mouse
- Left: move
- Right: fire

2. Keyboard
- Up: move
- Left / Right: rotate
- Spacebar: fire
```

## Gifshot

![Demo](https://i.imgur.com/Eqtse6G.gif)

[![Blocker - Game play 1](https://raw.githubusercontent.com/jojoee/blocker/master/screenshot/play1.jpg "Blocker - Game play 1")](http://blocker.jojoee.com/)

[![Blocker - Debug](https://raw.githubusercontent.com/jojoee/blocker/master/screenshot/debug.jpg "Blocker - Debug")](http://blocker.jojoee.com/) [![Greenkeeper badge](https://badges.greenkeeper.io/jojoee/blocker.svg)](https://greenkeeper.io/)

## Getting Started
1. Install [Node.js](https://nodejs.org/en/)
2. Install Nodemon Bower Gulp: `npm install -g nodemon yarn bower pm2`
3. Install dependencies: `yarn && bower install`

```
Build client side
- dev: `yarn build.watch`
- prod: `yarn build`
```

```
Start server side
- dev: `nodemon app.js --watch app.js`
- prod: `pm2 start app.js`
```

## Note
```
1. Code guideline & Naming we use
1.1 Base javascript style: [Airbnb](https://github.com/airbnb/javascript)
1.2 Function should return only one type
  e.g.
  - getName: string, '' (default)
  - getRandomInt: number, 0 (default)
  - getPlayers: Array, [] (default)
  - getPlayer: Object, {} (default)

  except getIndex
  e.g.
  - getIndexOfPlayer: number, -1 (default)

2. Naming
- Function / scope variable: `camelCase`  
- Global variable: `UPPERCASE`
- Class: `PascalCase`

3. Creature
- Monster
  - Zombie
  - Machine
  - Bat
- Hero
  - Player / Enemy

4. Socket
- Send to specific client: IO.sockets.connected[socketId].emit(EVENT_NAME, data);
- Send to all clients: IO.emit(EVENT_NAME, data);
- Send to all clients except newly created connection: socket.broadcast.emit(EVENT_NAME, data);

5. Event flow
Anything's related with `life` directly, is need to broadcast first then
take effect from subsequent request. (currently, there are only 2 events
(move / fire) that can execute on client before broadcasting)

6. CommonJs
```

## TODO
- [ ] All game calculation should be calculated on server-side
- [ ] Define structure of sending-object and response-object from server
- [ ] Send player-event to server (not data-object)
- [ ] Check `const` and `let` again
- [ ] Make all functions functional
- [ ] Remove all `eslint-disable-line`
- [ ] Add `checkAlive` event: the player is already gone, but it's still in the game (cause from network issue)
- [ ] Using [MessagePack](http://msgpack.org/) instead of JSON
- [ ] Respawn delay
- [ ] Redirect all pages to root (cause we only use root page)
- [ ] Update bubble/message graphic, [1](http://www.html5gamedevs.com/topic/8837-speech-bubble-text-with-rectangle-as-background/)
- [ ] Add deploy shell script
- [ ] Day / Night system
- [ ] Implement [Shields.io](https://shields.io/)
- [x] minimap, [1](http://www.html5gamedevs.com/topic/14182-creating-a-mini-map-in-phaser/), [2](http://www.html5gamedevs.com/topic/14930-creating-a-mini-map-from-a-render-texture/), [3](https://gist.github.com/jafrmartins/73e1e344237c980f3707f2760835f0bf)
- [ ] Responsive (support mobile / tablet user)
- [ ] Support screen when resizing 
- [ ] HUD
- [ ] Score board (Leader board)
- [ ] Cache
- [ ] Knockback when creature is hitted
- [ ] Add test (TDD) with test-task-runner, [1](https://github.com/gulpjs/gulp/blob/master/docs/recipes/mocha-test-runner-with-gulp.md)
- [ ] QA - Analysis / Optimize / Profiling / ETC (e.g. sonarqube)
- [ ] Sound
- [ ] Effect / Screen transition / Screen shake
- [ ] Fix - Creature is damaged and welled in the same time
- [ ] Arrow / Laser is killed when hit stoneGroup
- [ ] Room / Channel (able to create private room), [1](https://divillysausages.com/2015/07/12/an-intro-to-socket-io/), [2](http://www.tamas.io/advanced-chat-using-node-js-and-socket-io-episode-1/), [3](https://www.joezimjs.com/javascript/plugging-into-socket-io-advanced/)
- [ ] Add social meta / share
- [ ] Bot player
- [ ] Tween: player move
- [ ] Hero can collect item in the floor
- [ ] Other class (e.g. Swordsman)
- [ ] Monster path finder, [1](http://jojoee.github.io/phaser-examples/games/paths-face/), [2](http://jojoee.github.io/phaser-examples/games/boids-steering/), [3](http://jojoee.github.io/phaser-examples/games/easystarjs/)
- [ ] Creature sight feature, [1](http://jojoee.github.io/phaser-examples/games/bresenham-light/), [2](http://www.emanueleferonato.com/wp-content/uploads/2014/10/survival/), [3](http://jojoee.github.io/phaser-examples/games/horror-ray-casting/)
- [ ] Monster walk - random walk
- [ ] Monster can be fired, welled
- [ ] Talkable monster
- [ ] Tween: monster move

## Reference & Tutorial & Plugin & Tool
- Inspired by [Blocker](http://blockergame.com/)
- [phaser-multiplayer-game](https://github.com/xicombd/phaser-multiplayer-game)
- [phaser-screen-shake](https://github.com/dmaslov/phaser-screen-shake)
- [Text to ASCII Art Generator (TAAG)](http://patorjk.com/software/taag/)
- [phaser-state-transition](phaser-state-transition-plugin)
- [Tiled Map Editor](http://www.mapeditor.org/)

### Multiplayer
- Introduction to development of multiplayer HTML5 games (with Socket.io) [1](http://www.slideshare.net/Lotti86/introduction-to-multiplayer-game-development), [2](https://github.com/Lotti/codemotion2015)

### Data structure
- Generate id, [1](http://stackoverflow.com/questions/24041220/sending-message-to-a-specific-id-in-socket-io-1-0/), [2](http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript), [3](https://github.com/dylang/shortid), [4](https://github.com/broofa/node-uuid)
- [Remove / Generate client id](http://stackoverflow.com/questions/7702461/socket-io-custom-client-id)
