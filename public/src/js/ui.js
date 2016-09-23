/**
 * Client UI
 */

var UTIL = require('./../../../common/util');

var Ui = {

  logListEle: document.getElementById('logs'),
  playerListEle: document.getElementById('players'),

  /*================================================================ Dummy
   */

  /**
   * Dummy player list widget
   * 
   * @param {number} n
   */
  dummyPlayerList: function(n) {
    for (var i = 0; i < n; i++) {
      var playerId = UTIL.getRandomId();
      this.addPlayerIdToPlayerList(playerId);
    }
  },

  /**
   * Dummy log list
   * 
   * @param {number} n
   */
  dummyLogList: function(n) {
    for (var i = 0; i < n; i++) {
      var text = FAKER.lorem.sentence();
      this.addTextToLogList(text);
    }
  },

  /*================================================================ Log
   */

  /**
   * Add log into log list element
   * 
   * @param {string} text
   */
  addTextToLogList: function(text) {
    var liEle = document.createElement('li'),
      t = document.createTextNode(text);
    liEle.appendChild(t);

    // this.logListEle.appendChild(liEle);
    this.logListEle.insertBefore(liEle, this.logListEle.firstChild);
  },

  /*---------------------------------------------------------------- Log - Message
   */

  /**
   * Add Message into message list (log list)
   * TODO: complete it
   * 
   * @param {Message}
   */
  addPlayerMessageToMessageList: function(message) {

  },

  /*================================================================ Player list
   */

  /**
   * Add player to player list by player id
   * 
   * @param {string} playerId
   * @param {string} [customClass=]
   */
  addPlayerIdToPlayerList: function(playerId, customClass) {
    if (typeof customClass === 'undefined') customClass = 'enemy';
    var liEle = document.createElement('li'),
      t = document.createTextNode(playerId);

    liEle.appendChild(t);
    liEle.setAttribute('data-player-id', playerId);
    liEle.classList.add(customClass);

    this.playerListEle.appendChild(liEle);
  },

  /**
   * Remove player from player list by player id
   * 
   * @param {string} playerId
   */
  removePlayerFromPlayerList: function(playerId) {
    var liEle = document.querySelectorAll('[data-player-id="' + playerId + '"]')[0];

    UTIL.removeElement(liEle);
  },

  /*================================================================ Init
   */

  /**
   * Initialize UI
   */
  init: function() {
    // nothing
  },
};

module.exports = Ui;
