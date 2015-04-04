var app = require('http').createServer(handler),
  io = require('socket.io')(8000).sockets,
  fs = require('fs'),
  path = require('path');

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

//a user connects
io.on('connection', function(socket){
  console.log('A user connected :D');
});

app.listen(8080, function(){
  console.log('Server running on localhost:8080');
});
