// Stay bot

var Nightmare = require('nightmare'),
  url = 'http://blocker.jojoee.com/',
  n = 4;

for (i = 0; i < n; i++) {
  var nightmare = Nightmare();
  
  nightmare
    .goto(url)
    .wait('#game-wrap')
    .then(function(result) {
      console.log('Im stay');
    })
    .catch(function(error) {
      console.error('Error:', error);
    });
}
