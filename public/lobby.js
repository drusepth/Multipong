var Game = function() {
    this.socket = null;
    this.player = null;
};
Game.prototype.connect = function() {
    var self = this;
    this.socket = io.connect('http://localhost:8080/');
    
    this.socket.on('connect', function() {
        console.log('Connected, emit nick '+document.getElementById('nick').value);
        self.socket.emit('nick', document.getElementById('nick').value);
    });
    this.socket.on('init', function (players, id) { 
        console.log('Receive init ', players, id);
        Scoreboard.players = players;
        self.player = Scoreboard.players[id];
        Scoreboard.render();
    });
    this.socket.on('score', function (msg) {
        console.log('Score ', msg);
        Scoreboard.players[msg.user].score = msg.score; 
        Scoreboard.render();
    });        
    this.socket.on('new_player', function(player) {
        Scoreboard.players[player.id] = player;
        Scoreboard.render();
    });       
};

Game.prototype.decrement_score = function () {
    this.socket.emit('score', { user: this.player.id });        
};
var game = new Game();

var Scoreboard = function() {};
Scoreboard.players = [];

Scoreboard.render = function() {
    var str = '';
    for(var i = 0; i < Scoreboard.players.length; i++) {
        var player = Scoreboard.players[i];
        str += '<div>'+player.nick+'('+player.id+') Score: '+player.score+'</div>';                  
    }
    document.getElementById('scores').innerHTML = str;
};
