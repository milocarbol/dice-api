var constants = require('./constants.js');

var dice = {
  
  roll : function(count, die, operator, mod) {
    console.log('Rolling ' + count + 'd' + die + '' + operator + '' + mod);
    
    var isCrit = false;
    
    var rolls = [];
    var total = 0;
    for (var i = 0; i < count; i++) {
      var roll = Math.floor(Math.random() * die) + 1;
      rolls.push(roll);
      total += roll;
    }
    rolls.sort(function(a, b){return b-a;});
  
    var text = count + 'd' + die;
    if (mod) {
      text += operator + mod;
    }
    
    if (operator == '-') {
      total -= mod;
    }
    else {
      total += mod;
    }
    
    return {
      'text': text,
      'count': count,
      'die': die,
      'operator': operator,
      'mod': mod,
      'rolls': rolls,
      'total': total
    };
  },
  
  postProcess : function(result, request) {
    console.log('Post-processing...');
    if (request.query.user_name == 'milo') {
      if (result.count == 1 && result.die == 20) {
        console.log('Returning walnuts instead.');
        return {
          'doCustom': true,
          'responseType': constants.walnutResponse
        };
      }
    }
    else if (result.count == 1 && result.die == 20 && result.rolls[0] == 20) {
      console.log('Returning crit response.');
      return {
        'doCustom': true,
        'responseType': constants.critResponse
      };
    }
    else {
      console.log('No post-processing required.');
      return {
        'doCustom': false
      };
    }
  },

  parseText : function(roll) {
    console.log('Parsing ' + roll);
  
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
  },

  friendlyText : function(result, postProcessData) {
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
    }
    return text;
  },

  handle : function(request, response) {
    console.log('Received request: ' + JSON.stringify(request.query));
    var text = request.query.text;
    if (constants.notation.test(text)) {
      var parsedRoll = this.parseText(text);
      var result = this.roll(parsedRoll.count, parsedRoll.die, parsedRoll.operator, parsedRoll.mod);
      var postProcessData = this.postProcess(result, request);
      response.json({
        'response_type': 'in_channel',
        'text': this.friendlyText(result, postProcessData)
      });
    }
    else {
      response.send('"' + text + '" is not valid dice notation.');
    }
  }
};

module.exports = dice;
