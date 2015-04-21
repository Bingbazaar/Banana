/*Work in progress. */

var fs = require('fs');
var commands = exports.commands = {

  // mute: function(string, user){
  //   if(!this.name !== 'Mango') return false;
  // },
  exit: function(){
    io.emit('serverdown');
    process.exit();
  },

  // admin: function(string, user, socket){
  //   fs.readFile('./ranks.csv', function(err, data){
  //     if(err) throw err;
  //     data = data.toString().split('\n');
  //     for(i = 0; i < data.length; i++){
  //       if(user == data[i].substring(0, data[i].length - 2)){
  //         socket.admin = true;
  //         return true;
  //       }
  //     }
  //     return false;
  //   });
  // }
};
