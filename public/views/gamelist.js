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
