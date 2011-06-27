var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    qs = require('querystring'), 
    sio = require('socket.io');

var Router = require('./lib/router.js');
var router = new Router();

router.set('/', function(req, res, params, next) {
  fs.readFile('./public/index.html', function(err, data) {
    res.end(data);
  });
});
router.file('/favicon.ico', './public/favicon.ico');

var server = http.createServer(function(req, res) {router.route(req, res);} );
server.listen(8080, 'localhost');
var io = sio.listen(server);
io.set('log level', 0);

console.log('Server listening');

var Game = require('./lib/game.js');
var games = [];
games[0] = new Game();

io.sockets.on('connection', function (socket) {
  console.log('Connection');
  
  socket.on('nick', function(nickname) {
    console.log('Receive nick ', nickname);
    var player = games[0].player();
    player.nick = nickname;
    // send the player state
    console.log('send state', games[0].players, player.id);
    socket.emit('init', games[0].players, player.id);    
    socket.broadcast.emit('new_player', player);
  });
  
  // respond to score change
  socket.on('score', function(msg) {
    var player = games[0].player(msg.user);
    player.score--;
    console.log('Emitting score', msg, player);
    socket.broadcast.emit('score', { user: player.id, score: player.score });
    socket.emit('score', { user: player.id, score: player.score }); 
  });
  
  socket.on('disconnect', function() {
    console.log('Disconnected');
  });
});