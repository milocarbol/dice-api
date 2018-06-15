var constants = require('./constants');

var parser = {
  parseText : function(roll) {
    console.log('Parsing ' + roll);
    
    if (roll) {
      var split1 = roll.split('d');
      var count = split1[0] || 1;
      var operator = '+';
      if (split1[1].indexOf('-') > 0) {
        operator = '-';
      }
      var dieAndMod = split1[1].split(/\+|-/);
      var die = dieAndMod[0];
      var mod = dieAndMod[1] || 0;
  
      return {
        'count': parseInt(count),
        'die': parseInt(die),
        'operator': operator,
        'mod': parseInt(mod)
      };
    }
    else {
      return {
        'count': 1,
        'die': 20,
        'operator': '+',
        'mod': 0
      }
    }
  },
  
  toText : function(result, postProcessData) {
    var text = result.text + ': ' + result.total;
    if (result.rolls.length > 1) {
      text += ' (' + result.rolls.join(', ') + ')';
    }
    if (postProcessData.doCustom) {
      if (postProcessData.responseType == constants.walnutResponse) {
        text = constants.walnutText;
      }
      else if (postProcessData.responseType == constants.critResponse) {
        text += ' ' + constants.critText;
      }
      else if (postProcessData.responseType == constants.critFailResponse) {
        text += ' ' + constants.critFailText;
      }
    }
    return text;
  },
  
  isValidInput: function(text) {
    if (text) {
      return constants.notation.test(text);
    }
    else {
      return true;
    }
  }
}

module.exports = parser;