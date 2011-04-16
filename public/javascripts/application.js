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
    var green = 255 - count;
    var green = Math.round((255 - (count * 10)));
    if (green < 0) green = 255;
    return "#ff" + green.toString(16) + "00";
  }

  $('.ping').each(function(i, ping) {
    var num_counts = $(ping).children('p:last').text();
    $(ping).css('background-color', computeColor(num_counts));
  });
});
