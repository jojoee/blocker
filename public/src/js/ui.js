/**
 * Client UI
 */

const UTIL = require('./../../../common/util')

const Ui = {

  logListEle: document.getElementById('logs'),
  creatureListEle: document.getElementById('creatures'),
  sidebarEle: document.getElementById('sidebar'),
  messageInputEle: document.getElementsByClassName('message-input')[0],

  /* ================================================================ Log
   */

  /**
   * Add log into log list element
   *
   * @param {string} text
   */
  addTextToLogList: function (text) {
    if (IS_DEBUG) {
      const liEle = document.createElement('li')
      const t = document.createTextNode(text)
      liEle.appendChild(t)

      this.logListEle.insertBefore(liEle, this.logListEle.firstChild)
    }
  },

  /* ================================================================ Creature list
   */

  /**
   * Add creature id to creature list
   *
   * @param {string} creatureId
   * @param {string} [customClass=creature]
   */
  addCreatureIdToCreatureList: function (creatureId, customClass) {
    if (typeof customClass === 'undefined') customClass = 'creature'
    const liEle = document.createElement('li')
    const t = document.createTextNode(creatureId)

    liEle.appendChild(t)
    liEle.setAttribute('data-creature-id', creatureId)
    liEle.classList.add(customClass)

    this.creatureListEle.appendChild(liEle)
  },

  /**
   * Remove creature id from creature list
   *
   * @param {string} creatureId
   */
  removeCreatureIdFromCreatureList: function (creatureId) {
    const liEle = document.querySelectorAll('[data-creature-id="' + creatureId + '"]')[0]

    UTIL.removeElement(liEle)
  },

  /* ================================================================ Message
   */

  /**
   * Get message text from the input
   *
   * @returns {string}
   */
  getMessageInput: function () {
    return this.messageInputEle.value
  },

  /**
   * Enable message input
   * so we can type into it
   */
  enableMessageInput: function () {
    this.messageInputEle.style.opacity = 1
    this.messageInputEle.style.pointerEvents = 'visible'
    this.messageInputEle.focus()
  },

  /**
   * Disable message input
   * so we cannot type anymore
   */
  disableMessageInput: function () {
    this.messageInputEle.style.opacity = 0.4
    this.messageInputEle.style.pointerEvents = 'none'
    this.messageInputEle.blur()
    this.messageInputEle.value = ''
  },

  /* ================================================================ Init
   */

  /**
   * Initialize UI
   */
  init: function () {
    this.disableMessageInput()
  }
}

module.exports = Ui
