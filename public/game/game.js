// core game engine declarations

// might have to use pixels for x, and 1.0 for y

var Player = function() {
  this.id = 0;
  this.score = 0;
};

var Ball = function() {
  this.loc = {x:0.5, y:0};
  this.vel = {x:0, y:0.06};
  this.ball_radius = 20; // different sized screens?
};


Ball.prototype.move = function() {
  this.loc.x += this.vel.x;
  this.loc.y += this.vel.y;
  this.vel.y -= Game.gravity;  
};

var Paddle = function() {
  this.speed = 0.010;
  this.height = 0.1; 
  this.loc = {x:0.5, y: this.height};
  this.vel = {x:0, y:0};
  this.width = 0;
};

Paddle.prototype.move = function() {
    if(this.vel.x != 0) {
    this.loc.x += this.vel.x;
  //// FIRE AN EVENT HERE?
  }
  // paddle acceleration
  this.vel.x *= 1.05;
  // don't allow paddle to move too far
  if(this.loc.x - this.width/2 < 0)
    this.loc.x = this.width/2;
  if(this.loc.x + this.width/2 > 1)
    this.loc.x = 1-this.width/2;
}

var Game = function() {
  // current player
  this.init_player = 0;
  this.has_ball = false;
  this.w = 0;
  this.h = 0;
  this.fps = 30;
  
  this.game_id = 0;
  
  this.player = new Player();  
  this.ball = new Ball();
  this.paddle = new Paddle();
};

// constants
Game.gravity = 0.002;
Game.ball_rebound = 0.95;


// util functions --------------------------------------------------
Game.prototype.game_to_css_coords = function(location) {
    return {x: location.x*this.w, y:(1-location.y)*this.h};
};

Game.prototype.css_to_game_coords = function(location) {
    return {x: location.x/this.w, y:1-location.y*this.h};  
};

Game.prototype.cartesian_to_polar = function(location) {
    // r and theta
    // theta is respect to up
  return {r: Math.sqrt(Math.pow(location.x,2)+Math.pow(location.y,2)), t: Math.atan2(location.x, location.y)};  
};

Game.prototype.polar_to_cartesian = function(location) {
    return {x:location.r*Math.sin(location.t),
            y:location.r*Math.cos(location.t)};
};

// center object on location
Game.prototype.move_to_loc = function(element, location) {
    var tmp_loc = this.game_to_css_coords(location);
    var tmp_w = element.width(); // SO DUMB
    var tmp_h = element.height(); // SO SO DUMB
    element.css("left",tmp_loc.x-tmp_w/2);
    element.css("top" ,tmp_loc.y-tmp_h/2);
};

// calculate the velocity when changing screen geometries
Game.prototype.pass_velocity = function(velocity, geometry) {
    // concerned with vel.x
    var d_aspect = (this.w/this.h)/(geometry.w/geometry.h);
    velocity.x *= d_aspect;
    return velocity;
};

// timing stuff
var date;
var time_start = 0;

// push a message to the server
function send(type, payload) {
    // noop as of now
    console.log('SEND', type, payload);
    // game.socket.emit(type, payload);
}

// something for the callback
Game.prototype.receive = function(obj) {
   console.log('Game engine callback', obj);
    if(obj.type == "screen"){
        // send a ball to this screen
        if(this.player.id == obj.id) {
            console.log('Successful screen transition', obj);
            this.ball.vel = this.pass_velocity(obj.velocity, obj.geometry);
            this.ball.loc = obj.location;
            if(obj.direction == "left") {
                this.ball.loc.x += 1
            }
            if(obj.direction == "right") {
                this.ball.loc.x -= 1
            }
        }
    } else if(obj.type == "bounce") {
        if(this.player.id != obj.id) {
            console.log('Successful bounce', obj);
            // change arrow location, which is based on the ball.loc
            this.ball.loc.y = 0.1;
            this.ball.vel = obj.velocity;
        }
    } else if(obj.type == "drop") {
        if(this.player.id != obj.id) {
            console.log('Successful drop', obj);
            // display drop message
            $('#gamestate').text('Someone Else Dropped!').toggle(50).delay(3000).toggle(50);
        }
    } else if(obj.type == "score") {
        // someone else scores, we don't care (for now)
        // stub
    }  
};

// ------------------------------------------------------------

Game.prototype.start = function(init_player){
  // default values
  init_player || (init_player = 0);
  // vital stuff
  this.w = $(window).width();
  this.h = $(window).height();
  // if we start off,
  if(init_player == this.init_player) {
    this.ball.loc.x = Math.random()*0.4+0.3;
    this.ball.loc.y = 1-Math.random()*0.2;
    this.ball.vel = this.polar_to_cartesian({r:0.0,t:(Math.random()-0.5)*Math.PI});
    this.has_ball = true;
  }
  this.registerKeyboard();
  // for kicks and giggles
  this.paddle.width = this.css_to_game_coords({x:$("#main_paddle").width(),y:0}).x;
  // start it off
  this.tick();
};

Game.prototype.registerKeyboard = function() {
  var self = this;
    // handle events
    $(document).keydown(function(event){
        if(event.which == 39) {
            if(self.paddle.vel.x == 0)
                self.paddle.vel.x = self.paddle.speed;
        } else if(event.which == 37) {
            if(self.paddle.vel.x == 0)
                self.paddle.vel.x = -self.paddle.speed;
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
            self.paddle.vel.x = 0;
        // else if(event.which == 32)
    });  
};

Game.prototype.hasCollision = function(ball, paddle) {
  return (ball.loc.y > paddle.height && ball.loc.y+ball.vel.y < paddle.height);
};

Game.prototype.handleCollision = function(ball, paddle) {
    // check if it falls into the paddle
    if(ball.loc.x < paddle.loc.x + paddle.width/2 &&
      ball.loc.x > paddle.loc.x - paddle.width/2) {
      // it's a bounce!
      // convert to polar coordinates
      var polar = this.cartesian_to_polar(ball.vel);
      // slow it down
      polar.r *= Game.ball_rebound;
      // turn it around
      polar.t += Math.PI;
      polar.t *= -1;
      // change the velocity depending on where it lands
      polar.t += (ball.loc.x - paddle.loc.x)/(4*paddle.width);
      // change back
      ball.vel = this.polar_to_cartesian(polar);
      // add the paddle's velocity to the ball
      ball.vel.x += paddle.vel.x*0.5;
      
      // size down the paddle after a hit
      paddle.width *= 0.98;
      $("#main_paddle").width($("#main_paddle").width()*0.98);
      // comm
      send("bounce", {
        game: this.game_id, 
        id: this.player.id, 
        velocity: ball.vel
        });
      send("score", {
        game: this.game_id, 
        id: this.player.id, 
        score: this.player.score
        });
      var points_per_bounce = 50;
      $('#main_score').text( this.player.score += points_per_bounce).effect("shake", {times: 1}, 75);
      $('#watermark').effect("shake", {times: 1}, 150);
    }
  
};

Game.prototype.tick = function() {
  // get the current time
  date = new Date();
  time_start = date.getTime();
  // collision detection
  // if ball will fall past the paddle...
  if(this.hasCollision(this.ball, this.paddle) && this.has_ball) {
    this.handleCollision(this.ball, this.paddle);
  }

  // move the paddle
  this.paddle.move();

  // do stuff with the ball
  if(this.has_ball) {
    // move the ball
    this.ball.move();
    // check if the ball moves out of the area
    if(this.ball.loc.x < 0 || this.ball.loc.x > 1) {
      this.has_ball = false;
      $("#main_ball").hide();
      // send appropriate messages
      if( this.ball.loc.x < 0 ) {
        send("screen", {
          game: this.game_id, 
          id: this.player.id, 
          direction:"left", 
          geometry:{
            w: this.w, 
            h: this.h
          }, 
          location: this.ball.loc, 
          velocity: this.ball.vel
          });
      } else { // must be loc.x > 1.0
        send("screen", {
          game: this.game_id, 
          id: this.player.id, 
          direction:"right", 
          geometry:{
            w: this.w, 
            h: this.h
          }, 
          location: this.ball.loc, 
          velocity:this.ball.vel
          });
      }
    }
    // check if the ball is below the water line
    if(this.ball.loc.y < 0) {
      this.has_ball = false;
      $("#main_ball").hide();
      // send appropriate messages
      send("drop",{
        game: this.game_id, 
        id: this.player.id
      });
      send("score", {
        game: this.game_id, 
        id: this.player.id, 
        score: this.player.score
        });
      $('#gamestate').text('Dropped!').toggle(50).delay(3000).toggle(50);  
    }
    // draw the ball
    this.move_to_loc($("#main_ball"), this.ball.loc);
  } else {
    // move the arrow around
    this.ball.loc.y += this.ball.vel.y;
    this.move_to_loc($("#arrow"), this.game_to_css_coords(this.ball.loc).y);
  }

  // draw the paddle, draw it all the time
  this.move_to_loc($("#main_paddle"), this.paddle.loc);

  // do it over and over again
  date = new Date();
  // while trying to do 30fps
  var d_time = 1000/this.fps - (date.getTime()-time_start);
  var self = this;
  setTimeout( function() { self.tick(); }, d_time);  
};

