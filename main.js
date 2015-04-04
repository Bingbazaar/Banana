var app = require('http').createServer(handler),
  io = require('socket.io')(app).sockets,
  fs = require('fs'),
  path = require('path'),
  sanitize = require('google-caja').sanitize;


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

function validate(string){
  var message = sanitize(string);
  return message;
}

//a user connects
io.on('connection', function(socket){
  console.log('A user connected :D');

  //a message is sent
  socket.on('input', function(msg){
    message = validate(msg.msg);
    username = validate(msg.name);
    socket.emit('output', {
      msg: message,
      name: username
    });
  });

  //user disconnected
  socket.on('disconnect', function(socket){
    console.log('A user disconnected.');
  });
});


app.listen(8080, function(){
  console.log('Server running on localhost:8080');
});
