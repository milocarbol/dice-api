var https = require('https');
var express = require('express');
var app = express();

var notation = /^\d*d\d+(\+\d+)?$/;
var respondWithJson = 'json';
var respondToSlack = 'slack';
var respondWithText = 'text';

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
  
  var text = count + 'd' + die;
  if (add) {
    text += '+' + add;
  }
  
  return {
    'text': text,
    'rolls': rolls,
    'total': total + add
  };
}

function parseRoll(roll) {
  console.log('Parsing ' + roll);
  
  var split1 = roll.split('d');
  var count = split1[0] || 1;
  var dieAndAdd = split1[1].split('+');
  var die = dieAndAdd[0];
  var add = dieAndAdd[1] || 0;
  
  return {
    'count': parseInt(count),
    'die': parseInt(die),
    'add': parseInt(add)
  };
}

function friendlyText(result) {
  var text = result.text + ': ' + result.total;
  if (result.rolls.length > 1) {
    text += ' (' + result.rolls.join(', ') + ')';
  }
  return text;
}

function handleRequest(request, response, respondWith, friendlyError) {
  var text = request.query.text;
  if (notation.test(text)) {
    var parsedRoll = parseRoll(text);
    var result = rollDie(parsedRoll.count, parsedRoll.die, parsedRoll.add);
    
    switch (respondWith) {
    case respondWithJson:
      response.json(result);
      break;
    case respondToSlack:
      response.json({
        'response_type': 'in_channel',
        'text': friendlyText(result)
      });
      break;
    case respondWithText:
      response.send(friendlyText(result));
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

app.set('port', (process.env.PORT || 5000));

app.get('/roll/json', function(request, response) {
  handleRequest(request, response, respondWithJson, false);
});

app.get('/roll', function(request, response) {
  handleRequest(request, response, respondWithText, true);
});

app.get('/roll/slack', function(request, response) {
  handleRequest(request, response, respondToSlack, true);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
