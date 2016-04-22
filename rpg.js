var constants = require('./constants.js');

var rpg = {
  party: [],
  iniativeOrder : [],
  currentTurn : 0,
  initiativeRolled: false,
  
  cmdGetParty : 'getparty',
  cmdAddParty : 'addparty',
  cmdClrParty : 'clearparty',
  cmdRollInit : 'rollinit',
  cmdNextTurn : 'next',
  
  parseText : function(text) {
    return text.split(' ');
  },
  
  addToParty : function(args) {
    this.currentTurn = 0;
    this.initiativeRolled = false;
    
    for (var i = 0; i < args.length; i+=2) {
      if (!isNaN(parseInt(args[i+1]))) {
        console.log('Adding ' + args[i] + ' with initiative bonus of ' + args[i+1]);
        this.party.push({
          'name': args[i],
          'initiativeBonus': parseInt(args[i+1])
        });
      }
      else {
        console.log('Can\'t add ' + args[i] + ' with initiative bonus of ' + args[i+1]);
      }
    }
    return true;
  },
  
  getPartyAsString : function() {
    var text = '';
    for (var i = 0; i < this.party.length; i++) {
      var player = this.party[i];
      text += player.name + ' (';
      if (player.initiativeBonus >= 0) {
        text += '+' + player.initiativeBonus;
      }
      else {
        text += player.initiativeBonus;
      }
      text += ')';
      if (i < this.party.length - 1) {
        text += ', ';
      }
    }
    return text;
  },
  
  rollInitiativeForPlayer : function(player) {
    return {
      'name': player.name,
      'initiative': Math.floor(Math.random() * 20) + 1 + player.initiativeBonus,
      'initiativeBonus': player.initiativeBonus
    }
  },
  
  rollInitiative : function() {
    this.currentTurn = 0;
    this.initiativeRolled = true;
    
    this.initiativeOrder = this.party.map(this.rollInitiativeForPlayer);
    this.initiativeOrder.sort(function (a, b) {
      if (a.initiative > b.initiative) {
        return -1;
      }
      else if (a.initiative < b.initiative) {
        return 1;
      }
      else {
        if (a.initiativeBonus > b.initiativeBonus) {
          return -1;
        }
        else if (a.initiativeBonus < b.initiativeBonus) {
          return 1;
        }
        else {
          return 0;
        }
      }
    });
    
    console.log('Initiative order: ' + JSON.stringify(this.initiativeOrder));
  },
  
  nextTurn : function() {
    if (this.initiativeRolled) {
      this.currentTurn++;
      
      if (this.currentTurn < this.initiativeOrder.length) {
        return this.initiativeOrder[this.currentTurn-1];
      }
      else {
        this.currentTurn = 0;
        return this.initiativeOrder[this.initiativeOrder.length-1];
      }
    }
    else {
      return null;
    }
  },
  
  handleAddToParty : function(args, response, respondWith) {
    console.log('Adding to party: ' + args);
    
    this.addToParty(args);
    
    switch (respondWith) {
    case constants.respondWithJson:
      response.json(this.party);
      break;
    case constants.respondWithText:
      response.send(this.getPartyAsString());
      break;
    case constants.respondToSlack:
      response.json({
        'response_type': 'in_channel',
        'text': this.getPartyAsString()
      });
      break;
    }
  },
  
  handleGetParty : function(response, respondWith) {
    console.log('Getting party');
    
    switch (respondWith) {
    case constants.respondWithJson:
      response.json(this.party);
      break;
    case constants.respondWithText:
      response.send(this.getPartyAsString());
      break;
    case constants.respondToSlack:
      response.json({
        'response_type': 'in_channel',
        'text': this.getPartyAsString()
      });
      break;
    }
  },
  
  handleClearParty : function(response, respondWith) {
    console.log('Clearing party');
    
    this.party = [];
    
    switch (respondWith) {
    case constants.respondWithJson:
      response.json(this.party);
      break;
    case constants.respondWithText:
      response.sendStatus(200);
      break;
    case constants.respondToSlack:
      response.json({
        'response_type': 'in_channel',
        'text': 'Party cleared.'
      });
      break;
    }
  },
  
  handleInitiative : function(roll, response, respondWith, friendlyError) {
    if (roll) {
      console.log('Rolling initiative');
      this.rollInitiative();
    }
    
    console.log('Getting next player');
    
    var nextPlayer = this.nextTurn();
    if (nextPlayer) {
      console.log(nextPlayer.name + ' is next');
      switch (respondWith) {
      case constants.respondWithJson:
        response.json({
          'name': nextPlayer.name
        });
        break;
      case constants.respondWithText:
        response.send('Next: ' + nextPlayer.name);
        break;
      case constants.respondToSlack:
        response.json({
          'response_type': 'in_channel',
          'text': 'Next: ' + nextPlayer.name
        });
        break;
      }
    }
    else {
      if (friendlyError) {
        if (roll) {
          console.log('There\'s no party!');
          response.send('There\'s no party!');
        }
        else {
          console.log('Initiative hasn\'t been rolled');
          response.send('Initiative hasn\'t been rolled');
        }
      }
      else {
        response.sendStatus(400);
      }
    }
  },
  
  handle : function(request, response, respondWith, friendlyError) {
    var args = this.parseText(request.query.text);
    var command = args[0];
    args.shift();
    
    console.log('"' + command + '" requested')
    switch (command) {
    case this.cmdAddParty:
      this.handleAddToParty(args, response, respondWith);
      break;
    case this.cmdGetParty:
      this.handleGetParty(response, respondWith);
      break;
    case this.cmdClrParty:
      this.handleClearParty(response, respondWith);
      break;
    case this.cmdRollInit:
      this.handleInitiative(true, response, respondWith, friendlyError);
      break;
    case this.cmdNextTurn:
      this.handleInitiative(false, response, respondWith, friendlyError);
      break;
    default:
      if (friendlyError) {
        response.send('"' + command + '" is not a valid command.');
      }
      else {
        response.sendStatus(400);
      }
    }
  }
};

module.exports = rpg;
