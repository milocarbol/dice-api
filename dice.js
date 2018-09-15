var constants = require('./constants');
var parser = require('./parser');

var dice = {
  handle : function(request, response) {
    console.log('Received request: ' + JSON.stringify(request.query));
    var text = request.query.text;
    if (parser.isValidInput(text)) {
      var parsedRoll = parser.parseText(text);
      var result = this.roll(parsedRoll.count, parsedRoll.die, parsedRoll.operator, parsedRoll.mod, parsedRoll.unordered);
      var postProcessData = this.postProcess(result, request.query);
      response.json({
        'response_type': 'in_channel',
        'text': parser.toText(result, postProcessData)
      });
    }
    else {
      response.send('"' + text + '" is not valid dice notation.');
    }
  },
  
  roll : function(count, die, operator, mod, unordered) {
    console.log('Rolling ' + count + 'd' + die + '' + operator + '' + mod);
    
    var rolls = [];
    var total = 0;
    for (var i = 0; i < count; i++) {
      var roll = Math.floor(Math.random() * die) + 1;
      rolls.push(roll);
      total += roll;
    }
    if (!unordered) {
      rolls.sort(
        function(a, b) {
          return b - a;
        }
      );
    }
  
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
      'total': total,
      'unordered': unordered
    };
  },
  
  postProcess : function(result, requestInput) {
    console.log('Post-processing...');
    /*if (requestInput.user_name == 'yharamati' && Math.floor(Math.random() * 4) == 0) {
      if (result.count == 1 && result.die == 20) {
        console.log('Returning walnuts instead.');
        return {
          'doCustom': true,
          'responseType': constants.walnutResponse
        };
      }
    }
    else */if (result.count == 1 && result.die == 20 && result.rolls[0] == 20) {
      console.log('Returning crit response.');
      return {
        'doCustom': true,
        'responseType': constants.critResponse
      };
    }
    else if (result.count == 1 && result.die == 20 && result.rolls[0] == 1) {
      console.log('Returning crit fail response.');
      return {
        'doCustom': true,
        'responseType': constants.critFailResponse
      }
    }
    else {
      console.log('No post-processing required.');
      return {
        'doCustom': false
      };
    }
  }
};

module.exports = dice;
