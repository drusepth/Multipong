
var Game = require('./game.js').Game;
var Player = require('./game.js').Player;
var assert = require('assert');

var game = new Game('test', 1);
var p1 = new Player('a', 1);
var p2 = new Player('b', 2);
var p3 = new Player('c', 3);

game.add(p1);
game.add(p2);
game.add(p3);


assert.equal(game.leftOf(p1.id), p3.id);
assert.equal(game.leftOf(p3.id), p2.id);
assert.equal(game.leftOf(p2.id), p1.id);
assert.equal(game.rightOf(p1.id), p2.id);
assert.equal(game.rightOf(p2.id), p3.id);
assert.equal(game.rightOf(p3.id), p1.id);

game.move(p1, 1);
// 2 1 3

assert.equal(game.leftOf(p1.id), p2.id);
assert.equal(game.leftOf(p2.id), p3.id);
assert.equal(game.leftOf(p3.id), p1.id);
assert.equal(game.rightOf(p1.id), p3.id);
assert.equal(game.rightOf(p3.id), p2.id);
assert.equal(game.rightOf(p2.id), p1.id);
  