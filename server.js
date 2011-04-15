
/**
 * Module dependencies.
 */
console.log('loading server.js');

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

console.log(pings);

console.log('loaded dependecies');

var bayeux = new faye.NodeAdapter({
  mount: '/faye',
  timeout: 45
});

console.log('mounted faye');

var app = module.exports = express.createServer();

_.each([pings], function(model){ model.load(); });
var Ping = db.model('Ping');

console.log('bootstrap models');

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

console.log('configuration');

// Routes

app.get('/', function(req, res){
  Ping.find({}, function(err, results){
    res.render('index', {
      title: 'You see me',
      pings: results
    });
  });
});

app.post('/message', function(req, res) {
  console.log('received message');
  Ping.findOne({url: req.query.url}, function(err, ping) {
    if (!ping) {
      console.log("creating new ping");
      ping = new Ping({url: req.query.url});
    } else {
      console.log("updating ping count");
      ping.count = ping.count + 1;
    }
    ping.save(function (err) {
      console.log("ping saved!");
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
