var app = require('http').createServer(handler),
  io = require('socket.io')(app),
  fs = require('fs'),
  path = require('path'),
  messages = [],
  crypto = require('crypto');
  global.Parser = require('./parser.js');
  global.Commands = require('./commands.js').Commands;
  global.io = io;


//handler function for createServer method
function handler(req, res){
  var filePath = '.' + req.url;
  if(filePath == './') filePath = './index.html';

  var extname = path.extname(filePath);
  var contentType = 'text/html';
  switch(extname){
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
  }

  fs.exists(filePath, function(exists){
    if(exists){
      fs.readFile(filePath, function(error, content){
        if(error){
          res.writeHead(500);
          res.end();
        } else {
          res.writeHead(200, {'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });
}

function color(string){
  string = string.toLowerCase();
  return '#' + crypto.createHash('md5').update(string).digest('hex').slice(0, 6);
}

process.on('exit', function(){
  io.emit('serverdown');
  console.log('Server closed.');
});

//a user connects
io.on('connection', function(socket){
  console.log('A user connected :D');

  var output = '';
  for(x = 0; x < messages.length; x++){
    output += messages[x];
  }

  socket.emit('join', output);

  //a message is sent
  socket.on('input', function(msg){

    var message = Parser.filter(msg.msg),
    username = Parser.filter(msg.name),
    usercolor = color(username),
    command = message.substring(1, message.length);

    if(msg.msg.substring(0, 1) === '/'){
      Parser.parseCommand(command, username, socket);
    } else {
      if(Parser.valid(username, message)){
        io.emit('output', {
          msg: message,
          name: username,
          color: usercolor
        });
        //store the message for refreshes
        messages.push('<span class="message"><span class="username" style="color: ' + usercolor + ';">' +
        username + ':</span> ' + message + '</span>');
      }
    }
  });

  //user disconnected
  socket.on('disconnect', function(data){
    console.log('A user disconnected.');
    io.emit('disconnectioncomplete', {
      name: data.name
    });
  });

  socket.on('namechange', function(data){
    // if(Parser.parseCommand('admin', data.name, socket)){
    //   socket.admin = true;
    // }
    // if(Parser.valid(data.name)){
    data.name = Parser.filter(data.name);
    if(data.oldname) data.oldname = Parser.filter(data.oldname);
      io.emit('namechange complete', {
        name: data.name,
        oldname: (data.oldname ? data.oldname : false),
        join: (data.oldname ? false : true)
      });
    // }
  });

  socket.on('start typing', function(data){
    io.emit('typing', {
      name: Parser.filter(data.name),
      typing: data.typing
    });
  });

  socket.on('broadcast typing', function(data){
    io.emit('broadcast typing complete', {
      name: Parser.filter(data.name)
    });
  });

  socket.on('function', function(data){
    io.emit('function received', {
      function: data.function,
      name: Parser.filter(data.name)
    });
  });
});


app.listen(8080, function(){
  console.log('Server running on localhost:8080');
});
