
var Game = function() {
  this.socket = null;
  this.player = null;
  this.game_id = null;
};      
Game.prototype.connect = function(nick) {
  var nickname = nick;
  var self = this;
  this.socket = io.connect('http://localhost:8080/');
  // when connecting to the server
  this.socket.on('connect', function() {
    console.log('Connected, emit nick '+nickname);
    self.socket.emit('nick', nickname);
  });
  // when the player has been created on the server
  this.socket.on('player', function(player) {
    console.log('PLAYER INIT OK', player);
    self.player = player;
  });
  // when getting the list of games or when a new game is created
  this.socket.on('game_list', function( list) {
    GameList.games = list;
    console.log('game_list', list, GameList.games);
    GameList.render();
  });
  // when a new player joins the current game
  this.socket.on('new_player', function(player) {
    WaitView.players[player.id] = player;
    WaitView.render();
  });       
  // when a game is created
  this.socket.on('created', function(game_id) {
    this.game_id = game_id;  
  });
  // when the game starts        
  this.socket.on('game_start', function (players) { 
    console.log('Receive init ', players);
    Scoreboard.players = players;
    self.player = Scoreboard.players[self.player.id];
    $('#nickname_form').hide();
    $('#games_list').hide();
    $('#lobby').hide();
    $('#scoreboard').hide();
    $('#main').show();    
    start_game();
//    Scoreboard.render();
  });
  // when the score changes for a user
  this.socket.on('score', function (player) {
    console.log('Score ', player);
    Scoreboard.players[player.id].score = player.score; 
    Scoreboard.render();
  });        

  this.socket.on('screen', function(msg) {
    // trigger screen
    msg.type = 'screen';
    callback(msg);
  });

  this.socket.on('bounce', function(msg) {
    // trigger bounce
    msg.type = 'bounce';
    callback(msg);
  });
  this.socket.on('drop', function(msg) {
    // trigger drop
    msg.type = 'drop';
    callback(msg);
  });
};

// Create a game for other people to join
Game.prototype.create = function(title, game_id) {
  this.socket.emit('create', { title: title});
};

// Join an existing game
Game.prototype.join = function(game_id) {
  this.game_id = game_id;
  this.socket.emit('join', { game: this.game_id, id: this.player.id });
  $('#games_list').hide();
  $('#lobby').show();  
};

// Start the existing game
Game.prototype.start = function() {
  this.socket.emit('start', { game: this.game_id });
};

Game.prototype.decrement_score = function () {
  this.socket.emit('score', { game: this.game_id, id: this.player.id });        
};

game = new Game();

var Scoreboard = function() {};
Scoreboard.players = [];

Scoreboard.render = function() {
    var str = '';
    for(var i = 0; i < Scoreboard.players.length; i++) {
        var player = Scoreboard.players[i];
        str += '<div>'+player.nick+'('+player.id+') Score: '+player.score+'</div>';                  
    }
    document.getElementById('scoreboard').innerHTML = str;
};

var GameList = function () { };

GameList.games = [];

GameList.render = function() {
  var str = '';
  if(GameList.games.length == 0) {
    str = '<div>No games created. ...Yet.</div>';
  }
  for(var i = 0; i < GameList.games.length; i++) {
    var game = GameList.games[i];
    str += '<div><a href="javascript:game.join('+game.id+');"> '+game.title+'</a></div>';
  }
  document.getElementById('gamelist').innerHTML = str;
};

var WaitView = function() {};
WaitView.players = [];

WaitView.render = function() {
  var str = '';
  for(var i = 0; i < WaitView.players.length; i++) {
    var player = WaitView.players[i];
    if(player && player.nick) {
      str += '<div>'+player.nick+'('+player.id+')</div>';                  
    }
  }
  document.getElementById('players').innerHTML = str;                
};
