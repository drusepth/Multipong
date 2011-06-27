

var Player = function(nickname, id) {
  this.nick = nickname;
  this.score = 0;
  this.id = id;
};

var Ball = function() {
  this.x = 0;
  this.y = 0;
};

var Game = function(title, id) {
  this.id = id;
  this.title = title;
  this.players = [];  
  this.ball = new Ball;
};

Game.prototype.player = function(id) {
  if(id == undefined) {
    id = this.players.length;
  }
  this.players[id] || (this.players[id] = new Player(id));
  return this.players[id];
};

exports.Game = Game;
exports.Player = Player;