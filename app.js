
/**
 * Module dependencies.
 */
console.log('in here');

var faye    = require('faye'),
    express = require('express'),
    _       = require('underscore'),
    pings   = require('./lib/pings'),
    goose   = require('mongoose'),
    db      = goose.connect('mongodb://localhost/testy');

var bayeux = new faye.NodeAdapter({
  mount: '/faye',
  timeout: 45
});
  console.log(faye + 'faye?');

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
  Ping.find({}, function(err, pings){
    res.render('index', {
      locals: {
        title: 'You see me',
        pings: pings
      }
    });
  });
});

app.post('/message', function(req, res) {
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
