/**
 * Utility
 */

var Util = {

  /*---------------------------------------------------------------- Utility
   */

  /**
   * Returns a random integer between min (inclusive) and max (inclusive)
   * Using Math.round() will give you a non-uniform distribution! 
   * 
   * @see http://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
   * 
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  getRandomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Get random id
   *
   * @see http://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
   * 
   * @param  {number} [n=8] - number of returned id string
   * @return {string}
   */
  getRandomId: function(n) {
    if (typeof n === 'undefined') n = 8;
    var text = '',
      possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      i = 0;

    for (i = 0; i < n; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  },

  /**
   * Return a number of distance between 2 point
   * by given x1, y1, x2, y2
   * 
   * @param  {number} x1
   * @param  {number} y1
   * @param  {number} x2
   * @param  {number} y2
   * @return {number}
   */
  getDistance: function(x1, y1, x2, y2) {
    var dx = x1 - x2,
      dy = y1 - y2;

    return Math.sqrt(dx * dx + dy * dy);
  },

  /*---------------------------------------------------------------- Date & Time
   */

  /**
   * Get current UTC timestamp
   * 
   * @see http://stackoverflow.com/questions/221294/how-do-you-get-a-timestamp-in-javascript
   * 
   * @returns {number}
   */
  getCurrentUtcTimestamp: function() {
    return Date.now();
  },

  /**
   * Convert timestamp to local string
   * 
   * @see http://stackoverflow.com/questions/19485353/function-to-convert-timestamp-to-human-date-in-javascript
   * 
   * @param {number} timestamp
   * @returns {string}
   */
  convertTimestampToLocaleString: function(timestamp) {
    var dateTime = new Date(timestamp);

    return dateTime.toLocaleString();
  },

  /*---------------------------------------------------------------- DOM
   */

  /**
   * Remove element
   * 
   * @see http://stackoverflow.com/questions/3387427/remove-element-by-id
   * 
   * @param {Object} elem - DOM Element object
   */
  removeElement: function(elem) {
    elem.parentNode.removeChild(elem);
  },

  /*---------------------------------------------------------------- Log
   */

  /**
   * Server log (used by server only)
   * 
   * @param {string} title
   * @param {*} [data=]
   */
  serverLog: function(title, data) {
    if (typeof data === 'undefined') data = '';
    var text = this.getCurrentUtcTimestamp() + ' ' + title;

    console.log(text, data);
  },

  /**
   * Server bug log (used by server only)
   * 
   * @param {string} funcationName
   * @param {string} title
   * @param {*} [data=]
   */
  serverBugLog: function(funcationName, title, data) {
    if (typeof data === 'undefined') data = '';
    var text = 'BUG - ' + funcationName + ', ' + title;

    this.serverLog(text, data);
    // TOOD: Write log into file
  },

  /**
   * Client log (used by client only)
   * 
   * @param {string} title
   * @param {*} [data=]
   */
  clientLog: function(title, data) {
    if (typeof data === 'undefined') data = '';
    var text = title;

    console.log(text, data);
  },

  /**
   * Client bug log (used by client only)
   * 
   * @param {string} funcationName
   * @param {string} title
   * @param {*} [data=]
   */
  clientBugLog: function(title, data) {
    if (typeof data === 'undefined') data = '';

    console.error(title, data);
  }
};

module.exports = Util;
