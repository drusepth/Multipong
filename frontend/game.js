// core game engine declarations

// might have to use pixels for x, and 1.0 for y

var has_ball = false;
var ball = {loc: {x:0.5, y:0}, vel:{x:0, y:0.06}};
// var balls = [];
var ball_radius = 20; // different sized screens?
var gravity = 0.002;
var paddle_speed = 0.010;
var paddle_height = 0.1;
var paddle = {loc: {x:0.5, y:paddle_height},
              vel:{x:0, y:0},
              width:0};
var ball_rebound = 0.95;
var w = 0;
var h = 0;

var fps = 30;
var player = { name: "Player 1", points: 0 };

var date;
var time_start = 0;

// util functions --------------------------------------------------
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
    return {x:location.r*Math.sin(location.t),
            y:location.r*Math.cos(location.t)};
}

// center object on location
function move_to_loc(element, location) {
    var tmp_loc = game_to_css_coords(location);
    var tmp_w = element.width(); // SO DUMB
    var tmp_h = element.height(); // SO SO DUMB
    element.css("left",tmp_loc.x-tmp_w/2);
    element.css("top" ,tmp_loc.y-tmp_h/2);
}

// calculate the velocity when changing screen geometries
function pass_velocity(velocity, geometry) {
    // concerned with vel.x
    var d_aspect = (w/h)/(geometry.w/geometry.h);
    velocity.x *= d_aspect;
    return velocity;
}

// push a message to the server
function send(type, payload) {
    // noop as of now
    console.log(type+payload);
}

// ------------------------------------------------------------
function start_game() {
    has_ball = true;

    // handle events
    $(document).keydown(function(event){
        if(event.which == 39) {
            paddle.vel.x = paddle_speed;
        } else if(event.which == 37) {
            paddle.vel.x = -paddle_speed;
        } else if(event.which == 80) { // p
            // Pause the game (bypass our screen)
            $('#gamestate').text('Paused').toggle(50);
        } else if(event.which == 32) {
            // charge, special move, maybe implement
            // charge = true;
        } else {
            console.log("Key pressed: "+event.which);
        }
    });
    $(document).keyup(function(event){
        if(event.which == 39 || event.which == 37)
            paddle.vel.x = 0;
        // else if(event.which == 32)
    });

    paddle.width = css_to_game_coords({x:$("#main_paddle").width(),y:0}).x;

    var game = {};
    game.play = function(){
        // get the current time
        date = new Date();
        time_start = date.getTime();
        // collision detection
        // if ball will fall past the paddle...
        if(ball.loc.y > paddle_height &&
           ball.loc.y+ball.vel.y < paddle_height) {
            // check if it falls into the paddle
            if(ball.loc.x < paddle.loc.x + paddle.width/2 &&
               ball.loc.x > paddle.loc.x - paddle.width/2) {
                // it's a bounce!
                // convert to polar coordinates
                var polar = cartesian_to_polar(ball.vel);
                // slow it down
                polar.r *= ball_rebound;
                // turn it around
                polar.t += Math.PI;
                polar.t *= -1;
                // change the velocity depending on where it lands
                polar.t += (ball.loc.x - paddle.loc.x)/(4*paddle.width);
                // change back
                ball.vel = polar_to_cartesian(polar);
                // add the paddle's velocity to the ball
                ball.vel.x += paddle.vel.x*0.5;
                // size down the paddle after a hit
                paddle.width *= 0.98;
                $("#main_paddle").width($("#main_paddle").width()*0.98);
                // comm
                send("bounce", {velocity: ball.vel});
                send("score", {score:player.points});
                bounce();
            }
        }

        // move the paddle
        if(paddle.vel.x != 0) {
            paddle.loc.x += paddle.vel.x;
            //// FIRE AN EVENT HERE?
        }
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
            ball.vel.y -= gravity;
            // check if the ball moves out of the area
            if(ball.loc.x < 0 || ball.loc.x > 1) {
                has_ball = false;
                $("#main_ball").hide();
                // send appropriate messages
                if( ball.loc.x < 0 ) {
                    send("screen", {direction:"left", geometry:{w:w, h:h}, location:ball.loc, velocity:ball.vel});
                } else { // must be loc.x > 1.0
                    send("screen", {direction:"right", geometry:{w:w, h:h}, location:ball.loc, velocity:ball.vel});
                }
            }
            // check if the ball is below the water line
            if(ball.loc.y < 0) {
                has_ball = false;
                $("#main_ball").hide();
                // send appropriate messages
                send("drop",{});
                send("score",{score:player.points});
                // alert("YOU LOSE HAHAHA");
                $('#gamestate').text('Dropped!').toggle(50).delay(3000).toggle(50);
            }
            // draw the ball
            move_to_loc($("#main_ball"), ball.loc);
        }

        // draw the paddle, draw it all the time
        move_to_loc($("#main_paddle"), paddle.loc);
        
        // do it over and over again
        date = new Date();
        // while trying to do 30fps
        var d_time = 1000/fps - (date.getTime()-time_start);
        setTimeout(game.play, d_time);
    }

    // start it off
    game.play();
}

function bounce() {
    var points_per_bounce = 50;
    $('#main_score').text(player.points += points_per_bounce).effect("shake", {times: 1}, 75);
}

$(document).ready(function(){
    $('#main_player').text(player.name);

    w = $(window).width();
    h = $(window).height();

    start_game();
});
