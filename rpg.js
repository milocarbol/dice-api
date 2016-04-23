var constants = require('./constants.js');

var rpg = {
  party: [],
  monsters: [],
  initiativeOrder : [],
  
  cmdAddParty : 'addplayers',
  cmdGetParty : 'getplayers',
  cmdAddMonsters : 'addmonsters',
  cmdGetMonsters : 'getmonsters',
  cmdClearParty : 'clearparty',
  cmdClearMonsters : 'clearmonsters',
  cmdRollInit : 'rollinit',
  cmdGetInit : 'getinit',
  
  parseText : function(text) {
    return text.split(' ');
  },
  
  getCharactersAsString : function(characters) {
    var text = '';
    for (var i = 0; i < characters.length; i++) {
      var character = characters[i];
      text += character.name + ' (';
      if (character.initiativeBonus >= 0) {
        text += '+' + character.initiativeBonus;
      }
      else {
        text += character.initiativeBonus;
      }
      text += ')';
      if (i < characters.length - 1) {
        text += ', ';
      }
    }
    return text;
  },
  
  getInitiativeOrderAsString : function() {
    var text = '';
    for (var i = 0; i < this.initiativeOrder.length; i++) {
      var player = this.initiativeOrder[i];
      text += player.name + ' (' + player.initiative + ')';
      if (i < this.initiativeOrder.length - 1) {
        text += ', ';
      }
    }
    return text;
  },
  
  addTo : function(args, addTo) {
    for (var i = 0; i < args.length; i+=2) {
      if (!isNaN(parseInt(args[i+1]))) {
        console.log('Adding ' + args[i] + ' with initiative bonus of ' + args[i+1]);
        addTo.push({
          'name': args[i],
          'initiativeBonus': parseInt(args[i+1])
        });
      }
      else {
        console.log('Can\'t add ' + args[i] + ' with initiative bonus of ' + args[i+1]);
      }
    }
  },
  
  rollInitiativeForCharacter : function(player) {
    return {
      'name': player.name,
      'initiative': Math.floor(Math.random() * 20) + 1 + player.initiativeBonus,
      'initiativeBonus': player.initiativeBonus
    }
  },
  
  rollInitiative : function() {
    var all = this.party.concat(this.monsters);
    
    this.initiativeOrder = all.map(this.rollInitiativeForCharacter);
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
  
  handleAdd : function(isParty, args, response, respondWith) {
    var addTo = [];
    if (isParty) {
      console.log('Adding players: ' + args);
      addTo = this.party;
    }
    else {
      console.log('Adding monsters: ' + args);
      addTo = this.monsters;
    }
    
    this.addTo(args, addTo);
    
    switch (respondWith) {
    case constants.respondWithJson:
      response.json(addTo);
      break;
    case constants.respondWithText:
      response.send(this.getCharactersAsString(addTo));
      break;
    case constants.respondToSlack:
      response.json({
        'response_type': 'in_channel',
        'text': this.getCharactersAsString(addTo)
      });
      break;
    }
  },
  
  handleGet : function(isParty, response, respondWith) {
    var getFrom = [];
    if (isParty) {
      console.log('Getting players');
      getFrom = this.party;
    }
    else {
      console.log('Getting monsters');
      getFrom = this.monsters;
    }
    
    switch (respondWith) {
    case constants.respondWithJson:
      response.json(getFrom);
      break;
    case constants.respondWithText:
      response.send(this.getCharactersAsString(getFrom));
      break;
    case constants.respondToSlack:
      response.json({
        'response_type': 'in_channel',
        'text': this.getCharactersAsString(getFrom)
      });
      break;
    }
  },
  
  handleClear : function(isParty, response, respondWith) {
    if (isParty) {
      console.log('Clearing players');
      this.party = [];
    }
    else {
      console.log('Clearing monsters');
      this.monsters = [];
    }
    
    switch (respondWith) {
    case constants.respondWithJson:
      response.json([]);
      break;
    case constants.respondWithText:
      response.sendStatus('Cleared.');
      break;
    case constants.respondToSlack:
      response.json({
        'response_type': 'in_channel',
        'text': 'Cleared.'
      });
      break;
    }
  },
  
  handleRollInitiative : function(response, respondWith, friendlyError) {
    if (this.party.length > 0) {
      console.log('Rolling initiative');
      this.rollInitiative();
      
      var player = this.initiativeOrder[0];
      console.log(player.name + ' is first');
      switch (respondWith) {
      case constants.respondWithJson:
        response.json(this.initiativeOrder);
        break;
      case constants.respondWithText:
        response.send('First: ' + player.name);
        break;
      case constants.respondToSlack:
        response.json({
          'response_type': 'in_channel',
          'text': 'First: ' + player.name
        });
        break;
      }
    }
    else {
      if (friendlyError) {
        console.log('There\'s no party!');
        response.send('There\'s no party!');
      }
      else {
        response.sendStatus(400);
      }
    }
  },
  
  handleGetInitiative : function(response, respondWith, friendlyError) {
    if (this.initiativeOrder.length > 0) {
      console.log('Returning initiative');
      switch (respondWith) {
      case constants.respondWithJson:
        response.json(this.initiativeOrder);
        break;
      case constants.respondWithText:
        response.send(this.getInitiativeOrderAsString());
        break;
      case constants.respondToSlack:
        response.json({
          'response_type': 'in_channel',
          'text': this.getInitiativeOrderAsString()
        });
        break;
      }
    }
    else {
      if (friendlyError) {
        console.log('Initiative hasn\'t been rolled');
        response.send('Initiative hasn\'t been rolled!');
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
      this.handleAdd(true, args, response, respondWith);
      break;
    case this.cmdGetParty:
      this.handleGet(true, response, respondWith);
      break;
    case this.cmdClearParty:
      this.handleClear(true, response, respondWith);
      break;
    case this.cmdAddMonsters:
      this.handleAdd(false, args, response, respondWith);
      break;
    case this.cmdGetMonsters:
      this.handleGet(false, response, respondWith);
      break;
    case this.cmdClearMonsters:
      this.handleClear(false, response, respondWith);
      break;
    case this.cmdRollInit:
      this.handleRollInitiative(response, respondWith, friendlyError);
      break;
      break;
    case this.cmdGetInit:
      this.handleGetInitiative(response, respondWith, friendlyError);
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
