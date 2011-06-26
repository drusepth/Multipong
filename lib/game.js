

var Player = function() {
  this.score = 0;
};


var Game = function() {
  this.players = [];  
};

Game.prototype.player = function(id) {
  this.players[id] || (this.players[id] = new Player());
  return this.players[id];
};

module.exports = Game;