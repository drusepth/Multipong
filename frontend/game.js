// core game engine declarations

// might have to use pixels for x, and 1.0 for y

var has_ball = false;
var ball = {loc: {x:0.5, y:0}, vel:{x:0, y:0.04}};
var ball_radius = 20; // different sized screens?
var paddle_speed = 0.02;
var paddle_height = 0.1;
var paddle = {loc: {x:0.5, y:paddle_height},
	      vel:{x:0, y:0},
	      width:0};
var ball_rebound = 0.9;
var w = 0;
var h = 0;

var fps = 30;

function game_to_css_coords(location) {
    return {x: location.x*w, y:(1-location.y)*h};
}

function css_to_game_coords(location) {
    return {x: location.x/w, y:1-location.y*h};
}

function cartesian_to_polar(location) {
    // r and theta
    // theta is respect to up
    return {r: Math.sqrt(Math.pow(location.x,2)+Math.pow(location.y,2)), t: Math.atan2(location.x, location.y)};
}

function polar_to_cartesian(location) {
    // x and y, duh
    return {x:location.r*Math.sin(location.t),
	    y:location.r*Math.cos(location.t)};
}

function move_to_loc(element, location) {
    var tmp_loc = game_to_css_coords(location);
    var tmp_w = element.width(); // SO DUMB
    var tmp_h = element.height(); // SO SO DUMB
    element.css("left",tmp_loc.x-tmp_w/2);
    element.css("top" ,tmp_loc.y-tmp_h/2);
}

function start_game() {
    has_ball = true;

    paddle.width = css_to_game_coords({x:$("#main_paddle").width(),y:0}).x;

    var game = {};
    game.play = function(){
	// collision detection
	// if ball will fall past the paddle...
	if(ball.loc.y > paddle_height &&
	   ball.loc.y+ball.vel.y < paddle_height) {
	    var polar = cartesian_to_polar(ball.vel);
	    if(ball.loc.x < paddle.loc.x + paddle.width/2 &&
	       ball.loc.x > paddle.loc.x - paddle.width/2) {
		// reverse the velocity
		polar.r *= ball_rebound;
		polar.t += Math.PI;
		polar.t *= -1;
		polar.t += (ball.loc.x - paddle.loc.x)/(2*paddle.width);
		ball.vel = polar_to_cartesian(polar);
	    }
	}

	// move the paddle
	paddle.loc.x += paddle.vel.x;
	// don't allow paddle to move too far
	if(paddle.loc.x - paddle.width/2 < 0)
	    paddle.loc.x = paddle.width/2;
	if(paddle.loc.x + paddle.width/2 > 1)
	    paddle.loc.x = 1-paddle.width/2;

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
