var util = {
  /*================================================================ Utility
  */

  /**
   * Returns a random integer between min (inclusive) and max (inclusive)
   * Using Math.round() will give you a non-uniform distribution!
   *
   * @see http://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
   */
  getRandomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /*---------------------------------------------------------------- Date & Time
  */
  
  // http://stackoverflow.com/questions/221294/how-do-you-get-a-timestamp-in-javascript
  getCurrentUtcTimestamp: function() {
    return Date.now();
  },

  // http://stackoverflow.com/questions/19485353/function-to-convert-timestamp-to-human-date-in-javascript
  convertTimestampToLocaleString: function(timestamp) {
    var dateTime = new Date(timestamp);

    return dateTime.toLocaleString();
  },

  /*---------------------------------------------------------------- DOM
  */
 
  // http://stackoverflow.com/questions/3387427/remove-element-by-id
  removeElement: function(elem) {
    return elem.parentNode.removeChild(elem);
  },

  /*---------------------------------------------------------------- Log
  */
  
  // used by server only
  serverLog: function(title, data) {
    var text = util.getCurrentUtcTimestamp() + ' ' + title;

    if (data === undefined) data = '';
    console.log(text, data);
  },

  // used by server only
  serverBugLog: function(funcationName, title, data) {
    var text = 'BUG - ' + funcationName + ', ' + title;

    if (data === undefined) data = '';
    this.serverLog(text, data);
    // TOOD: Write log into file
  },

  // used by client only
  clientLog: function(title, data) {
    var text = title;
    
    if (data === undefined) data = '';
    console.log(text, data);
  },

  // used by client only
  clientBugLog: function(title, data) {
    if (data === undefined) data = '';
    console.error(title, data);
  }
};

if (typeof module !== 'undefined' && module.exports != null) {
  module.exports = {
    // Utility 
    getRandomInt: util.getRandomInt,

    // Time
    getCurrentUtcTimestamp: util.getCurrentUtcTimestamp,

    // DOM
    removeElement: util.removeElement,

    // Log
    serverLog: util.serverLog,
    serverBugLog: util.serverBugLog,
    clientLog: util.clientLog,
    clientBugLog: util.clientBugLog,
  };
}
