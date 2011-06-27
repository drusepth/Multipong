

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

Game.prototype.findById = function(id) {
  var result = -1;
  for(var i = 0; i < this.players.length; i++){
    if(this.players[i].id == id) {
      result = i;
      break;
    }
  }
  return result;
};

Game.prototype.leftOf = function(old_player) {
  var result = this.findById(old_player);
  if(result < 0) {
    return null;
  }
  result--;
  if(result < 0) {
    return this.players[this.players.length-1].id;
  } 
  return this.players[result].id;  
};

Game.prototype.rightOf = function(old_player) {
  var result = this.findById(old_player);
  if(result < 0) {
    return null;
  }
  result++;
  if(result >= this.players.length) {
    return this.players[0].id;
  } 
  return this.players[result].id; 
};

Game.prototype.add = function(player) {
  this.players.push(player);
};

Game.prototype.move = function(player, order) {
  var result = this.findById(player.id);
  this.players.splice(result, 1);
  this.players.splice(order, 0, player);
};

exports.Game = Game;
exports.Player = Player;