$(function() {

  // on page refresh

  $('.ping').each(function(i, ping) {
    var count = $(ping).children('span.count').text();
    $(ping).css('background-color', computeColor(count));
  });

  // live

  $('.ping').live('click', function() {
    window.open($(this).children('a:first').attr('href'));
  });

  $('.ping').live({
    "mouseover": function() {
      $(this).css("opacity", .5);
      var hover_url = $(this).children('a').attr('href').replace(/http:\/\//, '');
      $('#header h1').text(hover_url);
    },
    "mouseout": function() {
      $('#header h1').text('idrmx.');
      $(this).css("opacity", 1);
    }
  });

  // faye pubsub

  var client = new Faye.Client('http://idrmx.duostack.net:9980/faye', {
    timeout: 120
  });

  client.subscribe('/channel', function(msg) {
    var active_ping;
    if (msg.ping.count === 1) {
      active_ping = createPing(msg.ping);
      $('#pings').prepend(active_ping);
    } else {
      active_ping = $('.ping a[href=http://' + msg.ping.url + ']').parent();
      active_ping = updatePing(active_ping, msg.ping);
    }

    for(var i=0; i<2; i++) {
      $('#header h1').text(msg.ping.url);
      active_ping.animate({opacity: .2}, 500);
      active_ping.animate({opacity: 1}, 500);
    }
    $('#header h1').text('idrmx.');
  });

  // helpers

  function updatePing(ping, data) {
    ping.children('span.count').text(data.count);
    ping.children('span.instant').text(data.instant);
    ping.children('a').attr('href', "http://" + data.url);
    ping.css('background-color', computeColor(data.count));
    return ping;
  }

  function createPing(ping) {
    var template = $('#ping_template').clone();
    template.children('a').attr('href', "http://" + ping.url);
    template.children('span.count').text(ping.count);
    template.children('span.instant').text(ping.instant);
    template.css('background-color', computeColor(ping.count));
    template.removeAttr('id');
    return template;
  }

  function computeColor(count) {
    var green = 255 - count;
    green = Math.round((255 - (count * 5)));
    if (green < 0) {
      green = "00";
    } else if (green >= 0 && green <= 15) {
      green = "0" + green.toString(16);
    } else { green = green.toString(16); }
    return "#" + "ff" + green + "0f";
  }

});
