var mongoose = require('mongoose');
if (process.env['DUOSTACK_DB_MONGODB']) {
  var db = mongoose.connect(process.env['DUOSTACK_DB_MONGODB']);
} else {
  var db = mongoose.connect('mongodb://localhost/testy');
}

exports.load = function(){
  var Ping = new mongoose.Schema({
      url               : { type: String, index: true }
    , count             : { type: Number, default: 1 }
    , instant           : { type: Number, default: Date.now() }
  });
  mongoose.model('Ping', Ping);
};
