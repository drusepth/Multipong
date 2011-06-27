// core game engine declarations

// might have to use pixels for x, and 1.0 for y

var has_ball = false;
var ball = {loc: {x:0.5, y:0}, vel:{x:0, y:0.04}};
var ball_radius = 20; // different sized screens?
var paddle_speed = 0.03;
var paddle_height = 0.1;
var paddle = {loc: {x:0, y:paddle_height},
	      vel:{x:0, y:0},
	      width:0.25}; 
var w = 0;
var h = 0;

var fps = 30;

function game_to_css_coords(location) {
    return {x: location.x*w, y:(1-location.y)*h};
}

function move_to_loc(element, location) {
    var tmp_loc = game_to_css_coords(location);
    element.css("left",tmp_loc.x-ball_radius/2);
    element.css("top" ,tmp_loc.y-ball_radius/2);
}

function start_game() {
    has_ball = true;

    var game = {};
    
    game.play = function(){
	// collision detection
	if(ball.loc.y > paddle_height &&
	   ball.loc.y+ball.vel.y < paddle_height) {
	    if(ball.loc.x < paddle.loc.x + paddle.width/2 &&
	       ball.loc.x > paddle.loc.x - paddle.width/2) {
		// reverse the velocity
		ball.vel.y = -ball.vel.y
		// change the direction depending on the paddle side
		ball.vel.x += ball.loc.x - paddle.loc.x
	    }
	}

	// move the paddle
	paddle.loc.x += paddle.vel.x;

	// do stuff with the ball
	if(has_ball) {
	    // move the ball
	    ball.loc.x += ball.vel.x;
	    ball.loc.y += ball.vel.y;
	    ball.vel.y -= 0.001;
	    // draw the ball
	    move_to_loc($("#main_ball"), ball.loc);
	}

	// draw the paddle, draw it all the time
	move_to_loc($("#main_paddle"), paddle.loc);
	
	// do it over and over again
	setTimeout(game.play, 1000/fps);
    }

    setTimeout(game.play,1000/fps);
}

$(document).ready(function(){
    w = $(window).width();
    h = $(window).height();
    // ball_radius = ;
    start_game();

    $(document).keydown(function(event){
	  if(event.which == 39) {
	      paddle.vel.x = paddle_speed;
	  }
	  if(event.which == 37) {
	      paddle.vel.x = -paddle_speed;
	  }
    if(event.which == 80) { // p
        // Pause the game (bypass our screen)
        $('#gamestate').text('Paused').toggle(50);
    }
});

    $(document).keyup(function(event){
	paddle.vel.x = 0;
    });
});
