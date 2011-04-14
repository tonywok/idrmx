var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/testy');

exports.load = function(){
  var Ping = new mongoose.Schema({
      url               : { type: String, index: true }
    , count             : { type: Number, default: 1 }
  });
  mongoose.model('Ping', Ping);
};
