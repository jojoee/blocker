var util = {
  
  // http://stackoverflow.com/questions/221294/how-do-you-get-a-timestamp-in-javascript
  getCurrentUtcTimestamp: function() {
    return Date.now();
  },

  /**
   * Returns a random integer between min (inclusive) and max (inclusive)
   * Using Math.round() will give you a non-uniform distribution!
   *
   * @see http://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
   */
  getRandomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

if (typeof module !== 'undefined' && module.exports != null) {
  module.exports = {
   getCurrentUtcTimestamp: util.getCurrentUtcTimestamp,
   getRandomInt: util.getRandomInt,
  }
}
