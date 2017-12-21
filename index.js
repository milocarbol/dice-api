var express = require('express');
var dice = require('./dice');

var app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/roll/slack', function(request, response) {
  dice.handle(request, response);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
