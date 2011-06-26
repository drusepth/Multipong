var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    qs = require('querystring');

var Router = require('./lib/router.js');
var router = new Router();

router.set('/', function(req, res, params, next) {
  fs.readFile('./public/index.html', function(err, data) {
    res.end(data);
  });
});
router.file('/favicon.ico', './public/favicon.ico');

var server = http.createServer(function(req, res) {router.route(req, res);} );
server.listen(8080, 'localhost');

