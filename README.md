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

## Code guideline
```
1. Base javascript style: [Airbnb](https://github.com/airbnb/javascript)
2. Global variable should be UPPERCASE
4. Function should return only one type
  e.g.
  - getName: string, '' (default)
  - getRandomInt: number, 0 (default)
  - getPlayers: array, [] (default)
  - getPlayer: object, {} (default)

  except getIndex
  e.g.
  - getIndexOfPlayer: number, -1 (default)
```

## Known bugs
- [ ] When enemy was pushed to the `well` or `fire` area, it doesn't call `hitWell` or `hitFire` event
- [ ] When creature overlap `well` / `fire` floor, it do not work properly

## TODO
- [ ] `spacebar` can fire arrow
- [ ] Respawn monster when it's died
- [ ] Monster path finder, [1](http://jojoee.github.io/phaser-examples/games/paths-face/), [2](http://jojoee.github.io/phaser-examples/games/boids-steering/), [3](http://jojoee.github.io/phaser-examples/games/easystarjs/)
- [ ] Creature sight feature, [1](http://jojoee.github.io/phaser-examples/games/bresenham-light/), [2](http://www.emanueleferonato.com/wp-content/uploads/2014/10/survival/), [3](http://jojoee.github.io/phaser-examples/games/horror-ray-casting/)
- [ ] Player / Enemy can collect item in the floor
- [ ] Message icon and message bouble when send the message
- [ ] Responsive (support mobile / tablet user)
- [ ] Tutorial for development
- [x] Implement webfont
- [x] Implement module pattern both client and server
- [x] Gulp.js for client development
- [x] Nodemon for server development
- [ ] Redirect all pages to root (cause we only use root page)
- [ ] Monster (random walk)
- [x] Weapon behind the player
- [x] Move player body in front of weapon
- [x] Map by [Tiled Map Editor](http://www.mapeditor.org/)
- [x] Control: Mouse (mouse over keyboard)
- [ ] Add deploy shell script
- [ ] Knockback when creature is hitted
- [ ] Add test (TDD) with test-task-runner, [1](https://github.com/gulpjs/gulp/blob/master/docs/recipes/mocha-test-runner-with-gulp.md)
- [ ] Fix resize
- [ ] Inner-scroll
- [x] Universal / Isomorphic concepts
- [x] Fix enemy animation
- [x] Fix angle
- [ ] Plugin: Screen shaker when player's attacked
- [ ] Update global variable on server side code
- [ ] HUD
- [x] Bring `creature label` to the top
- [x] Player always top
- [ ] Boss mode
- [ ] Score board
- [ ] Update Favicon
- [x] Concat + Minify
- [ ] Cache (server)
- [ ] Cache (client with Service Worker)
- [x] Log system
- [ ] Error system
- [ ] Testing
- [ ] Document
- [ ] Analysis
- [ ] Fix gulp (when new image was added, it's does not copy to `dist` folder)
- [ ] Optimize / Profiling
- [ ] Quality tools (e.g. sonarqube)
- [x] Preload / Loading screen
- [ ] Sound
- [ ] Effect / Screen transition
- [ ] Refactor
- [ ] Refactor (in term of encapsulation)
- [ ] Local storage
- [ ] Monster + A* algorithm
- [ ] Update DocBlockr
- [ ] Day / Night system
- [ ] Character selector
- [ ] Implement monster nest
- [ ] Update all graphics + Font
- [ ] Support resize screen
- [ ] Multi line chat
- [x] Log combat (e.g. atk, kill)
- [ ] Log filter
- [x] Set emitter
- [x] Using [pm2](https://github.com/Unitech/pm2) for deploy
- [ ] Minimap
- [ ] Using [hashids](http://hashids.org/) to generate id instead
- [ ] Implement [Shields.io](https://shields.io/)

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
