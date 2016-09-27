/**
 * Client UI
 */

var UTIL = require('./../../../common/util');

var Ui = {

  logListEle: document.getElementById('logs'),
  creatureListEle: document.getElementById('creatures'),
  sidebarEle: document.getElementById('sidebar'),
  messageInputEle: document.getElementsByClassName('message-input')[0],

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

    this.logListEle.insertBefore(liEle, this.logListEle.firstChild);
  },

  /*================================================================ Creature list
   */

  /**
   * Add creature info to creature list
   * 
   * @param {CreatureInfo} creatureInfo
   * @param {string} [customClass=]
   */
  addCreatureInfoToCreatureList: function(creatureInfo, customClass) {
    if (typeof customClass === 'undefined') customClass = 'creature';
    var creatureId = creatureInfo.id,
      liEle = document.createElement('li'),
      t = document.createTextNode(creatureId);

    liEle.appendChild(t);
    liEle.setAttribute('data-creature-id', creatureId);
    liEle.classList.add(customClass);

    this.creatureListEle.appendChild(liEle);
  },

  /**
   * Remove creature from creature list
   * unused
   * 
   * @param {CreatureInfo} creatureInfo
   */
  removeCreatureFromCreatureList: function(creatureInfo) {
    var creatureId = creatureInfo.id,
      liEle = document.querySelectorAll('[data-creature-id="' + creatureId + '"]')[0];

    UTIL.removeElement(liEle);
  },

  /*================================================================ Message
   */

  getMessageInput: function() {
    return this.messageInputEle.value;
  },

  enableMessageInput: function() {
    this.messageInputEle.style.opacity = 1;
    this.messageInputEle.style.pointerEvents = 'visible';
    this.messageInputEle.focus();
  },

  disableMessageInput: function() {
    this.messageInputEle.style.opacity = .4;
    this.messageInputEle.style.pointerEvents = 'none';
    this.messageInputEle.blur();
    this.messageInputEle.value = '';
  },

  /*================================================================ Init
   */

  /**
   * Initialize UI
   */
  init: function() {
    this.disableMessageInput();
  },
};

module.exports = Ui;
