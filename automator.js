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

  Automator.prototype.clearModel = function() {
    _.map(this.words.query(), function(record) {
      return record.deleteRecord();
    });
    return _.map(this.categories.query(), function(record) {
      return record.deleteRecord();
    });
  };

  Automator.prototype.train = function(text, category) {
    var self, words;
    category = category.toLowerCase();
    words = text.toLowerCase().split(" ");
    this._increment(this.categories, category);
    self = this;
    _.map(words, function(word) {
      var categoryCount, record;
      record = self._increment(self.words, word);
      categoryCount = (record.get(category)) || 0;
      return record.set(category, categoryCount + 1);
    });
  };

  Automator.prototype.classify = function(text) {
    var confidence, maxC, maxCprime, maxP, maxPprime, self;
    self = this;
    maxC = "unknown";
    maxP = 0;
    maxCprime = "unknown";
    maxPprime = 0;
    _.map(self.categories.query(), function(record) {
      var category, p;
      category = record.get("NAME");
      p = self._getConditionalProbability(text, category);
      if (p > maxP) {
        maxCprime = maxC;
        maxPprime = maxP;
        maxC = category;
        return maxP = p;
      }
    });
    confidence = ((maxP - maxPprime) / maxP) || 0;
    return {
      category: maxC,
      reason: [],
      confidence: confidence
    };
  };

  Automator.prototype._getConditionalProbability = function(text, givenCategory) {
    var category, categorySum, condWordSum, pCategory, pCond, pEvidence, self, wordSum, words;
    category = givenCategory.toLowerCase();
    words = text.toLowerCase().split(" ");
    self = this;
    pEvidence = 1;
    wordSum = this._sumTable(this.words);
    _.map(words, function(word) {
      return pEvidence *= (1 + self._getWordCount(word)) / (1 + wordSum);
    });
    pCond = 1;
    condWordSum = this._sumTableConditional(this.words, category);
    _.map(words, function(word) {
      return pCond *= (1 + self._getConditionalWordCount(word, category)) / (1 + condWordSum);
    });
    categorySum = this._sumTable(this.categories);
    pCategory = (1 + this._getCategoryCount(category)) / (1 + categorySum);
    console.log(category);
    console.log("" + pCond + " * " + pCategory + " / " + pEvidence);
    return pCond * pCategory / pEvidence;
  };

  Automator.prototype._sumTable = function(table) {
    var sum;
    sum = 0;
    _.map(table.query(), function(record) {
      return sum += record.get("COUNT" || 0);
    });
    return sum;
  };

  Automator.prototype._sumTableConditional = function(table, category) {
    var sum;
    sum = 0;
    _.map(table.query(), function(record) {
      var categoryCount;
      categoryCount = record.get(category);
      if (category != null) {
        return sum += record.get(category || 0);
      }
    });
    return sum;
  };

  Automator.prototype._getWordCount = function(word) {
    var records;
    records = this.words.query({
      NAME: word
    });
    if (records.length < 1) {
      return 0;
    }
    return (records[0].get("COUNT")) || 0;
  };

  Automator.prototype._getConditionalWordCount = function(word, category) {
    var records;
    records = this.words.query({
      NAME: word
    });
    if (records.length < 1) {
      return 0;
    }
    return (records[0].get(category)) || 0;
  };

  Automator.prototype._getCategoryCount = function(category) {
    var records;
    records = this.categories.query({
      NAME: category
    });
    if (records.length < 1) {
      return 0;
    }
    return (records[0].get("COUNT")) || 0;
  };

  Automator.prototype._increment = function(table, name) {
    var count, record, records;
    records = table.query({
      NAME: name
    });
    record = records[0];
    if (records.length < 1) {
      record = table.insert({
        NAME: name,
        COUNT: 0
      });
    }
    count = record.get("COUNT");
    record.set('COUNT', count + 1);
    return record;
  };

  return Automator;

})();
