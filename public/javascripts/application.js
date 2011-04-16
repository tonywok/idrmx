$(function() {
  var client = new Faye.Client('http://idrmx.duostack.net:9980/faye', {
    timeout: 120
  });

  client.subscribe('/channel', function(msg) {
    var template = $('#ping_template').clone();
    template.children('p:first').text(msg.ping.url);
    template.children('p:last').text(msg.ping.count);
    template.attr('id', '');
    $('#pings').append(template);
  });

  function computeColor(count) {
    var green = Math.round((255 - (count * 5)));
    return "#ff" + green.toString(16) + "00";
  }

  $('.ping').each(function(i, ping) {
    var num_counts = $(ping).children('p:last').text();
    var green = 255 - num_counts;
    console.log(computeColor(num_counts));
    $(ping).css('background-color', computeColor(num_counts));
  });

});
