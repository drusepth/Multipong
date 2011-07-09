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
