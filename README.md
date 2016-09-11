# Blocker
Multiplayer online game using Phaser + WebSocket (Socket.IO).

## Getting Started
1. Install [Node.js](https://nodejs.org/en/)
2. Install Nodemon Bower Gulp: `npm install -g nodemon gulp bower`
3. Install dependencies: `npm install & bower install`
4. Start: `node app.js`
5. Enjoy!

## Guideline
```
1. Base javascript style: [Airbnb](https://github.com/airbnb/javascript)
2. Global variable should be UPPERCASE
3. `$` prefix for element
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

## Feature
- [x] Global chat
- [x] Typing status
- [ ] Private chat
- [x] Online player
- [x] Chat log (256 messages)
- [ ] GM mode / id
- [ ] Command (that used by player e.g. list all players)
- [ ] Room / Channel (able to create private room)
- [ ] Support mobile / tablet user
- [ ] Tutorial for development

## TODO
- [x] Gulp.js for client and server development
- [ ] Redirect all pages to root (cause we only use root page)
- [ ] Monster (random walk)
- [ ] Map by [Tiled Map Editor](http://www.mapeditor.org/)
- [x] Control: Keyboard
- [ ] Inner-scroll
- [ ] Facebook like + comment
- [ ] Add social meta (og meta)
- [x] Add [Github ribbon](http://tholman.com/github-corners/)
- [ ] Add Social share
- [ ] Bot player
- [ ] Fix enemy animation
- [ ] Fix angle
- [ ] Plugin: Screen shaker when player's attacked
- [ ] Control: Mouse (mouse over keyboard)
- [ ] Update global variable on server side code
- [ ] HUD
- [ ] Player always top
- [ ] Boss mode
- [ ] Score board
- [ ] Update Favicon
- [ ] Latest messages (256 messages)
- [ ] Concat + Minify
- [ ] Cache (server)
- [ ] Cache (client with Service Worker)
- [ ] Log system
- [ ] Error system
- [ ] Testing
- [ ] Document
- [ ] Analysis
- [ ] Optimize / Profiling
- [ ] Quality tools
- [x] Preload / Loading screen
- [ ] Sound
- [ ] Effect / Screen transition
- [ ] Refactor
- [ ] Refactor (in term of encapsulation)
- [ ] Local storage
- [ ] Monster + A* algorithm
- [ ] Control: Keyboard (user can customize)
- [ ] Control: Virtual joystick (for mobile user)
- [ ] Docblockr
- [ ] Day / Night system
- [ ] Character selector
- [ ] Update all graphics + Font
- [ ] Support resize screen
- [ ] Multi line chat
- [ ] Log combat (e.g. atk, kill)
- [ ] Log filter
- [ ] Set animation when join / die / rebirth
- [ ] Set emitter

## In considering
- [ ] [appmetrics.js](https://github.com/ebidel/appmetrics.js)
- [x] Remove jQuery
- [x] Remove lodash
- [x] Remove moment
- [ ] Promise
- [ ] Optimize player list (e.g. using `Angular`, etc.)
- [ ] Protect client source (obfuscation + top layer)
- [ ] CSS preprocessor
- [x] [gulp-nodemon](https://github.com/JacksonGariety/gulp-nodemon)
- [ ] Create own `screen-shake` plugin

## Reference & Tutorial & Plugin && Tool
- Inspired by [Blocker](http://blockergame.com/)
- [phaser-multiplayer-game](https://github.com/xicombd/phaser-multiplayer-game)
- [phaser-screen-shake](https://github.com/dmaslov/phaser-screen-shake)
- [Text to ASCII Art Generator (TAAG)](http://patorjk.com/software/taag/)
- [phaser-state-transition](phaser-state-transition-plugin)
