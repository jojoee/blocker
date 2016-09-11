// TODO: Move (move everything inside it)
/*
document.addEventListener('DOMContentLoaded', function() {
  
});
*/

// game
GAME.state.add('Boot', BLOCKER.Boot);
GAME.state.add('Load', BLOCKER.Load);
GAME.state.add('Play', BLOCKER.Play);

GAME.state.start('Boot');
