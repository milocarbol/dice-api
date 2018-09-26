var constants = require('./constants');

var parser = {
  parseText : function(roll) {
    console.log('Parsing ' + roll);
    
    if (roll) {
      var parsedRoll = roll.match(constants.notation);
      var count = parsedRoll[constants.diceCountIndex] || 1;
      var die = parsedRoll[constants.dieTypeIndex];
      var operator = parsedRoll[constants.operatorIndex] || '+';
      var mod = parsedRoll[constants.modifierIndex] || 0;
      var unordered = parsedRoll[constants.unorderedFlagIndex] === 'u';
      console.log('Parsed: ' + parsedRoll);
      console.log('\tCount: ' + count);
      console.log('\tDie: ' + die);
      console.log('\tOperator: ' + operator);
      console.log('\tModifier: ' + mod);
      console.log('\tUnordered: ' + unordered);
      return {
        'count': parseInt(count),
        'die': parseInt(die),
        'operator': operator,
        'mod': parseInt(mod),
        'unordered': unordered
      };
    }
    else {
      return {
        'count': 1,
        'die': 20,
        'operator': '+',
        'mod': 0,
        'unordered': false
      }
    }
  },
  
  toText : function(result, postProcessData) {
    var text = result.text + ': ';
    if (result.rolls.length == 1) {
      text += result.total;
    }
    else if (result.unordered) {
      text += result.rolls.join(', ');
    }
    else if (!result.unordered) {
      text += result.total + ' (';
      text += result.rolls.join(', ');
      text += ')';
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