# Blocker
Multiplayer online game using Phaser + WebSocket (Socket.IO).

## Getting Started
1. Install [Node.js](https://nodejs.org/en/)
2. Install Nodemon Bower Gulp: `npm install -g nodemon gulp bower`
3. Install dependencies: `npm install & bower install`
4. Start: `node app.js`
5. Build client script: `gulp`
6. Enjoy!
```
for develop the client side, please run - `gulp watch`
```

## Deploy
1. Install `pm2`: `npm install pm2 -g`
2. Build client script: `gulp`
3. Run app: `pm2 start app.js`

## Code guideline & Naming we use
```
1. Base javascript style: [Airbnb](https://github.com/airbnb/javascript)
2. Function should return only one type
  e.g.
  - getName: string, '' (default)
  - getRandomInt: number, 0 (default)
  - getPlayers: array, [] (default)
  - getPlayer: object, {} (default)

  except getIndex
  e.g.
  - getIndexOfPlayer: number, -1 (default)

Naming
- Function / scope variable: `camelCase`  
- Global variable: `UPPERCASE`
- Class: `PascalCase`

*note*
- Monster
  + Zombie
  + Machine
  + Bat

- Creature
  + Monster
  + Hero
```

## TODO
- [x] `spacebar` can fire arrow
- [x] Respawn monster when it's died
- [x] Messaging
- [x] Fix birth point of creature
- [x] Machine fire laser
- [x] Monster (random walk)
- [ ] Phaser server side
- [ ] Make it online
- [x] Implement webfont
- [x] Implement module pattern both client and server
- [x] Gulp.js for client development
- [x] Nodemon for server development
- [x] Weapon behind the player
- [x] Move player body in front of weapon
- [x] Map by [Tiled Map Editor](http://www.mapeditor.org/)
- [x] Control: Mouse (mouse over keyboard)
- [ ] Redirect all pages to root (cause we only use root page)
- [ ] Update bubble/message graphic
- [ ] Add deploy shell script
- [ ] Day / Night system
- [ ] Monster path finder, [1](http://jojoee.github.io/phaser-examples/games/paths-face/), [2](http://jojoee.github.io/phaser-examples/games/boids-steering/), [3](http://jojoee.github.io/phaser-examples/games/easystarjs/)
- [ ] Player / Enemy can collect item in the floor
- [ ] Implement [Shields.io](https://shields.io/)
- [ ] Minimap
- [ ] Creature sight feature, [1](http://jojoee.github.io/phaser-examples/games/bresenham-light/), [2](http://www.emanueleferonato.com/wp-content/uploads/2014/10/survival/), [3](http://jojoee.github.io/phaser-examples/games/horror-ray-casting/)
- [ ] Tutorial for development
- [ ] Talkable monster
- [ ] Arorw / Laser is killed when hit stoneGroup
- [ ] Responsive (support mobile / tablet user)
- [ ] Support screen when resizing 
- [ ] Add test (TDD) with test-task-runner, [1](https://github.com/gulpjs/gulp/blob/master/docs/recipes/mocha-test-runner-with-gulp.md)
- [x] Universal / Isomorphic concepts
- [ ] Plugin: Screen shaker when player's attacked
- [ ] HUD
- [ ] Fix - monster can be pushed through stoneGroup
- [x] Bring `creature label` to the top
- [x] Player always top
- [ ] Boss mode
- [ ] Score system
- [x] Immortal mode for debugging
- [ ] Score board (Leader board)
- [ ] Update Favicon
- [x] Concat + Minify
- [ ] Cache (server)
- [ ] Cache (client with Service Worker)
- [ ] Knockback when creature is hitted
- [x] Log system
- [ ] Error system
- [ ] Testing
- [ ] Document
- [ ] Analysis
- [ ] Optimize / Profiling
- [ ] Quality tools (e.g. sonarqube)
- [x] Preload / Loading screen
- [ ] Sound
- [ ] Effect / Screen transition
- [ ] Refactor
- [ ] Refactor (in term of encapsulation)
- [ ] Local storage
- [ ] Update DocBlockr
- [ ] Character selector
- [ ] Implement monster nest
- [ ] Update all graphics + Font
- [ ] Multi line chat
- [x] Log combat (e.g. atk, kill)
- [ ] Log filter
- [x] Set emitter
- [x] Using [pm2](https://github.com/Unitech/pm2) for deploy

## TODO: Online
- [ ] Online mode
- [ ] Global chat
- [ ] Typing status
- [ ] Private chat
- [ ] Online player
- [ ] Chat log (256 messages)
- [ ] GM mode / id
- [ ] Command (that used by player e.g. list all players)
- [ ] Room / Channel (able to create private room), [1](https://divillysausages.com/2015/07/12/an-intro-to-socket-io/), [2](http://www.tamas.io/advanced-chat-using-node-js-and-socket-io-episode-1/), [3](https://www.joezimjs.com/javascript/plugging-into-socket-io-advanced/)

## TODO: Social
- [ ] Facebook like + comment
- [ ] Add social meta (og meta)
- [ ] Add [Github ribbon](http://tholman.com/github-corners/)
- [ ] Add Social share
- [x] Bot player
- [ ] Bot (make it smoother)

## In considering
- [ ] [appmetrics.js](https://github.com/ebidel/appmetrics.js)
- [x] Remove jQuery
- [x] Remove lodash
- [x] Remove moment
- [ ] Promise
- [ ] Optimize player list (e.g. using `Angular`, etc.)
- [x] CSS preprocessor
- [ ] Create own `screen-shake` plugin
- [ ] Using [hashids](http://hashids.org/) to generate id instead

## Reference & Tutorial & Plugin && Tool
- Inspired by [Blocker](http://blockergame.com/)
- [phaser-multiplayer-game](https://github.com/xicombd/phaser-multiplayer-game)
- [phaser-screen-shake](https://github.com/dmaslov/phaser-screen-shake)
- [Text to ASCII Art Generator (TAAG)](http://patorjk.com/software/taag/)
- [phaser-state-transition](phaser-state-transition-plugin)

## Others
- [Express.js - app.listen vs server.listen](http://stackoverflow.com/questions/17696801/express-js-app-listen-vs-server-listen)
- Introduction to development of multiplayer HTML5 games (with Socket.io) [1](http://www.slideshare.net/Lotti86/introduction-to-multiplayer-game-development), [2](https://github.com/Lotti/codemotion2015)
- Express serve static file, [1](http://stackoverflow.com/questions/5924072/express-js-cant-get-my-static-files-why), [2](https://expressjs.com/en/starter/static-files.html)
- Generate id, [1](http://stackoverflow.com/questions/24041220/sending-message-to-a-specific-id-in-socket-io-1-0\), [2](http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript), [3](https://github.com/dylang/shortid), [4](https://github.com/broofa/node-uuid)
- [Remove / Generate client id](http://stackoverflow.com/questions/7702461/socket-io-custom-client-id)
