var constants = require('./constants.js');

var dice = {
  
  roll : function(count, die, operator, mod) {
    console.log('Rolling ' + count + 'd' + die + '' + operator + '' + mod);
  
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
      'rolls': rolls,
      'total': total
    };
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

  friendlyText : function(result) {
    var text = result.text + ': ' + result.total;
    if (result.rolls.length > 1) {
      text += ' (' + result.rolls.join(', ') + ')';
    }
    return text;
  },

  handle : function(request, response, respondWith, friendlyError) {
    var text = request.query.text;
    if (constants.notation.test(text)) {
      var parsedRoll = this.parseText(text);
      var result = this.roll(parsedRoll.count, parsedRoll.die, parsedRoll.operator, parsedRoll.mod);
    
      switch (respondWith) {
      case constants.respondWithJson:
        response.json(result);
        break;
      case constants.respondToSlack:
        response.json({
          'response_type': 'in_channel',
          'text': this.friendlyText(result)
        });
        break;
      case constants.respondWithText:
        response.send(this.friendlyText(result));
      }
    }
    else {
      if (friendlyError) {
        response.send('"' + text + '" is not valid dice notation.');
      }
      else {
        response.sendStatus(400);
      }
    }
  }
};

module.exports = dice;
