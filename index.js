var https = require('https');
var express = require('express');
var app = express();

var notation = /^\d*d\d+(\+\d+)?$/

function rollDie(count, die, add) {
  console.log('Rolling ' + count + 'd' + die + '+' + add);
  
  var rolls = [];
  var total = 0;
  for (i = 0; i < count; i++) {
    var roll = Math.floor(Math.random() * die) + 1;
    rolls.push(roll);
    total += roll;
  }
  rolls['total'] = total+add;
  return {'rolls': rolls, 'total': total + add};
}

function parseRoll(roll) {
  console.log('Parsing ' + roll);
  
  var split1 = roll.split('d');
  var count = split1[0] || 1;
  var dieAndAdd = split1[1].split('+');
  var die = dieAndAdd[0];
  var add = dieAndAdd[1] || 0;
  
  return {'count': parseInt(count), 'die': parseInt(die), 'add': parseInt(add)};
}

app.set('port', (process.env.PORT || 5000));

app.get('/roll', function(request, response) {
  var roll = request.query.roll;
  if (notation.test(roll)) {
    var parsedRoll = parseRoll(roll);
    var result = rollDie(parsedRoll.count, parsedRoll.die, parsedRoll.add);
    
    console.log('Returning result: ' + JSON.stringify(result));
    response.json(result);
  }
  else {
    response.sendStatus(400);
  }
});

app.get('/slackroll', function(request, response) {
  var roll = request.query.text;
  if (notation.test(roll)) {
    var parsedRoll = parseRoll(roll);
    var result = rollDie(parsedRoll.count, parsedRoll.die, parsedRoll.add);
    
    var rolls = '(' + result.rolls.join(', ') + ')';
    response.send(parsedRoll.count + 'd' + parsedRoll.die + '+' + parsedRoll.add + ': ' + result.total + ' (' + result.rolls.join(', ') + ')');
  }
  else {
    response.sendStatus(400);
  }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
