/**
 * Module dependencies.
 */

var faye    = require('faye'),
    express = require('express');
    _       = require('underscore'),
    pings   = require('./lib/pings'),
    goose   = require('mongoose');
    if (process.env['DUOSTACK_DB_MONGODB']) {
      var db = goose.connect(process.env['DUOSTACK_DB_MONGODB']);
    } else {
      var db = goose.connect('mongodb://localhost/testy');
    }

var bayeux = new faye.NodeAdapter({
  mount: '/faye',
  timeout: 45
});

var app = module.exports = express.createServer();

_.each([pings], function(model){ model.load(); });
var Ping = db.model('Ping');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.compiler({ src: __dirname + '/public', enable: ['sass'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res){
  var now = Date.now();
  var week_ago = now - 604800000;
  Ping.find({instant: {$gt: week_ago}}, function(err, results){
    res.render('index', {
      title: 'idrmx',
      pings: results
    });
  });
});

function checkForSecret(req, res, next) {
  if (req.query.secret !== process.env['IDRMX_SECRET']) {
    return new next(Error("invalid secret key"));
  }
  next();
}

app.post('/message', checkForSecret, function(req, res) {
  Ping.findOne({url: req.query.url }, function(err, ping) {
    if (!ping) {
      ping = new Ping({url: req.query.url});
    } else {
      var now = Date.now();
      var week_ago = now - 432000000;

      if (ping.instant > week_ago) {
        ping.count = ping.count + 1;
      } else {
        ping.count = 1;
      }
      ping.instant = Date.now();
    }
    ping.save(function (err) {
      if (!err) console.log('ping saved');
    });
    bayeux.getClient().publish('/channel', {ping: ping});
    res.send(200);
  });
});

bayeux.attach(app);

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
