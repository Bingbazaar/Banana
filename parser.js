var commands = require('./commands.js').commands,
  sanitize = require('google-caja').sanitize;

module.exports = {
  filter: function (string){
    var message = sanitize(string);
    return message;
  },

  valid: function(name, message){
    //remove whitespace
    name = name.trim();
    if(message) message = message.trim();
    if(!message.length && message !== null) return false
    if(!name.length) return false;
    return true;
  },

  parseCommand: function(string, user, socket){
    // user.admin = true;
    // if(user.admin){
      commands[string](string, user, socket);
    // }
  }
};
