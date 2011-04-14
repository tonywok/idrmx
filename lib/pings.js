var mongoose = require('mongoose');
if (process.env['DUOSTACK_DBMONGODB']) {
  var db = mongoose.connect(process.env['DUOSTACK_DBMONGODB']);
} else {
  var db = mongoose.connect('mongodb://localhost/testy');
}

exports.load = function(){
  var Ping = new mongoose.Schema({
      url               : { type: String, index: true }
    , count             : { type: Number, default: 1 }
  });
  mongoose.model('Ping', Ping);
};
