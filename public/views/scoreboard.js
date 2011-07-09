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
