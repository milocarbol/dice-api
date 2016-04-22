var express = require('express');
var dice = require('./dice');
var constants = require('./constants.js');

var app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/roll/json', function(request, response) {
  dice.handle(request, response, constants.respondWithJson, false);
});

app.get('/roll', function(request, response) {
  dice.handle(request, response, constants.respondWithText, true);
});

app.get('/roll/slack', function(request, response) {
  dice.handle(request, response, constants.respondToSlack, true);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
