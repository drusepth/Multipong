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

var Game = require('./lib/game.js').Game;
var Player = require('./lib/game.js').Player;
var games = [];
var players = [];

io.sockets.on('connection', function (socket) {
  console.log('Connection');
  
  // when connecting to the server
  socket.on('nick', function(nickname) {
    console.log('Receive nick ', nickname);
    var player = new Player(nickname, players.length);
    players.push(player);
    // send the player state
    console.log('send state', player);
    socket.emit('player', player);        
    // send the list of games 
    socket.emit('game_list', games);    
  });
  // when a new game is created
  socket.on('create', function(msg) {
    console.log('create new game', msg, games);
    games.push(new Game(msg.title, games.length));
    socket.join('/game/'+games.length);
    console.log('broadcast games', games);
    socket.broadcast.emit('game_list', games);
    socket.emit('game_list', games);     
  });
  
  // when a player joins a game
  socket.on('join', function(msg) {
    console.log('Join '+msg.game, players[msg.id]);
    socket.join('/game/'+msg.game);
    socket.broadcast.to('/game/'+msg.game).emit('new_player', players[msg.id]);    
    socket.emit('new_player', players[msg.id]); 
  });
  
  // when the game is started
  socket.on('start', function(msg) {
    socket.broadcast.to('/game/'+msg.game).emit('game_start');
    socket.emit('game_start'); 
  });
  
  // respond to score change
  socket.on('score', function(msg) {
    var player = players[msg.id];
    player.score--;
    console.log('Emitting score', msg, player);
    socket.broadcast.to('/game/'+msg.game).emit('score', { id: player.id, score: player.score });
    socket.emit('score', { id: player.id, score: player.score }); 
  });
  
  socket.on('disconnect', function() {
    console.log('Disconnected');
  });
});