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

console.log('Server listening');

var Game = require('./lib/game.js');
var games = [];
games[0] = new Game();

io.sockets.on('connection', function (socket) {
  console.log('Connection');
  
  // send the player state
  socket.emit('init', games[0].player(1));
  
  // respond to score change
  socket.on('score', function(msg) {
    console.log('Emitting score', msg);
    var player = games[0].player(msg.user);
    player.score--;
    socket.broadcast.emit('score', player.score);
    socket.emit('score', player.score);
  });
  
  socket.on('disconnect', function() {
    console.log('Disconnected');
  });
});