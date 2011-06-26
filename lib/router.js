
var url = require('url'),
    fs = require('fs'),
    path = require('path');
/**
 * Simple router for handling requests.
 */
var Router = function() {
  this.routes = [];
};

/**
 * Set a route.
 */
Router.prototype.set = function(regexp, callback) {
  this.routes.push([ regexp, callback] );
};

/**
 * Match the next route. Called on request.
 */
Router.prototype.next = function(i, url_parts, req, res) {
  var self = this;
  if(this.routes[i]) {
    if(this.routes[i][0] instanceof RegExp && this.routes[i][0].test(url_parts.pathname)) {
      // execute the route      
      return this.routes[i][1].call(null, req, res, this.routes[i][0].exec(url_parts.pathname), function() { self.next(i+1, url_parts, req, res); });
    } else if(this.routes[i][0].constructor == String && this.routes[i][0] == url_parts.pathname) {
      return this.routes[i][1].call(null, req, res, null, function() { self.next(i+1, url_parts, req, res); });
    } 
  }
  if(i >= this.routes.length) {
    console.log('Route not found: '+url_parts.pathname);
    return res.end();
  } else {
    return this.next(i+1, url_parts, req, res);
  }
}

/**
 * Perform routing on a req, res pair from an http server.
 */
Router.prototype.route = function(req, res) {
  var url_parts = url.parse(req.url);
//  console.log(url_parts);  
  // check all routes for a match
  this.next(0, url_parts, req, res);
}

/**
 * Route and serve static files from a directory.
 */
Router.prototype.directory = function(expression, basedir) {
  var self = this;
  this.routes.push([expression, function(req, res, params, next) { self.readFile(req, res, basedir+path.normalize(params[1]), next);} ]);
};

Router.prototype.file = function(expression, filename) {
  var self = this;
  this.routes.push([expression, function(req, res, params, next) { self.readFile(req, res, filename, next);} ]);  
};

/**
 * Handler for file reads.
 */
Router.prototype.readFile = function(req, res, filename, next) {
  fs.stat(filename, function(err, stat) {
    if(err || stat.isDirectory()) {
      return ('ENOENT' == err.code ? next() : function() { throw err }() );
    }
    res.setHeader('Content-Length', stat.size);
    var ext = path.extname(filename);
    switch(ext) {
      case '.ico':
        res.setHeader('Content-type', 'image/x-icon');        
        break;
      case '.html':
        res.setHeader('Content-type', 'text/html');        
        break;
      case '.hdbs':
      case '.js':
        res.setHeader('Content-type', 'text/javascript');        
        break;
      case '.css':
        res.setHeader('Content-type', 'text/css');        
        break;
      case '.png':
        res.setHeader('Content-type', 'image/png');        
        break;
      default:
    }
    
    var stream = fs.createReadStream(filename);
    stream.pipe(res);
    req.on('close', function() { stream.destroy(); });
  }); 
};

module.exports = Router;