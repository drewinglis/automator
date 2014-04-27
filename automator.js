// Generated by CoffeeScript 1.6.3
var Automator;

Automator = (function() {
  Automator.prototype.options = {
    namespace: "automator"
  };

  function Automator(datastore, options) {
    if (options == null) {
      options = {};
    }
    $.extend(this.options, options);
    this.datastore = datastore;
    this.categories = datastore.getTable("" + this.options.namespace + "-categories");
    this.words = datastore.getTable("" + this.options.namespace + "-words");
  }

  Automator.prototype.train = function(text, category) {};

  Automator.prototype.classify = function(text) {
    return {
      classification: {
        category: "unknown",
        reason: [],
        confidence: 0
      }
    };
  };

  return Automator;

})();
