$(function(){
  var socket = io();
  var getNode = function(string){
    return document.querySelector(string);
  },
  messages = getNode('.chat'),
  oldname,
  name,
  messageSent = false,
  typers = [];

  if(socket !== undefined){

    var typing = false,
      timeout,
      name;

      function doneTyping(){
        socket.emit('start typing', {
          typing: false,
          name: $('.username').val()
        });
        // $('.typing').html('');
        socket.emit('function', {
          function: 'clearTyping',
          name: $('.username').val()
        });
      }

      $('.chat textarea').keypress(function(event){
        if(event.which !== 13){
          if(!typing && ($('.chat textarea').val().length > 0)){
            socket.emit('start typing', {
              typing: true,
              name: $('.username').val()
            });
          } else {
            clearTimeout(timeout);
            timeout = setTimeout(doneTyping, 3000);
          }
        } else {
          doneTyping();
        }
      });

      socket.on('typing', function(data){
        if(data.typing === true){
          if($('#' + data.name).length === 0){
            if($('.typing').html().length === 0) {
              $('.typing').html('<span id="' + data.name + '">' + data.name + ' is typing...</span>');
              typers.push(data.name);
            } else {
              typers.push(data.name);
              $('.typing').html(typers.join(', and ')).replace(' is ', ' are ');
            }
          }
        } else {
          $('#' + data.name).remove();
        }
        name = data.name;
      });

    // var searchTimeout,
    //   typing = [],
    //   emitted = false,
    //   index,
    //   typingTimer;
    // $('.chat textarea').keypress(function(event){
    //   if(event.which != 13){
    //     if(searchTimeout != undefined) clearTimeout(searchTimeout);
    //     searchTimeout = setTimeout(doneTyping, 7000);
    //
    //     // if(!emitted){
    //       socket.emit('start typing', {
    //         name: $('.username').val()
    //       });
    //       socket.on('done typing', function(data){
    //         index = typing.indexOf(data.name);
    //         if($('.chat textarea').val() == '' && index > -1){
    //           typing.splice(index, 1);
    //         } else if(index == -1) {
    //           typing.push(data.name);
    //
    //           if($('.typing').html() == '') {
    //             if(typing.length == 1){
    //               $('.typing').html(typing.join(', ') + ' is typing...');
    //             } else if(typing.length >= 2){
    //               $('.typing').html(typing.join(', and ') + ' are typing...');
    //             }
    //           }
    //         }
    //       });
    //       // emitted = true;
    //     // }
    //   }
    // });

    // function doneTyping(){
    //   socket.emit('broadcast typing', {
    //     name: $('.username').val()
    //   });
    //   socket.on('broadcast typing complete', function(data){
    //     $('.typing').html('');
    //     typing.splice(index, 1);
    //   });
    //   emitted = false;
    // }

  $('.chat textarea').keypress(function(event){
    messageSent = false;
    var self = this,
      name = $('.username').val();
    var username = getNode('.username').value;
    if(event.which == 13 && !event.shiftKey){
      socket.emit('input', {
        name: name,
        msg: self.value
      });
      event.preventDefault();
      $('.chat textarea').val('');
      $('.typing').html('');
      // clearTimeout(typingTimer);
      messageSent = true;
      typing = false;
      // typing.splice(index, 1);
      return false;
    }
  });

  socket.on('output', function(data){
    if(data){
      $('.chat-log').append('<span class="message"><span class="username" style="color: ' + data.color + ';">' +
      data.name + ':</span> ' +data.msg + '</span>');
      $('.chat-log').scrollTop($('.chat-log')[0].scrollHeight);
    }
  });

    socket.on('join', function(messages){
      $('.chat-log').append(messages);
      $('.chat-log').scrollTop($('.chat-log')[0].scrollHeight);
    });

    socket.on('serverdown', function(){
      alert('The server is no longer online.');
    });

    $('.username').focus(function(){
      if($('.username').val().length > 0) oldname = $('.username').val();
    });

    $('.username').focusout(function(){
      if($('.username').val().length){
        name = $('.username').val();
        if(oldname && name.trim() !== oldname.trim()){
          socket.emit('namechange', {
            name: $('.username').val(),
            oldname: oldname
          });
        } else if(!oldname){
          socket.emit('namechange', {
            name: $('.username').val()
          });
        }
      }
    });

    socket.on('namechange complete', function(data){
      if(data.name.length){
        if(data.oldname){
          $('.chat-log').append('<span class="notice">' + data.oldname + ' changed username to ' + data.name + '</span>');
        } else if(data.join){
          $('.chat-log').append('<span class="notice">' + data.name + ' joined the chat</span>');
        }
      }
    });

    // var typingTimer,
    //   doneTypingInterval = 3000,
    //   emitted = false;
    // $('.chat textarea').keyup(function(e){
    //   // if(e.which >= 65 && e.which <= 90){
    //   //
    //   // }
    //   clearTimeout(typingTimer);
    //   if($('.chat textarea').val().length > 0) typingTimer = setTimeout(doneTyping, doneTypingInterval);
    //   if(!emitted){
    //     socket.emit('start typing', {
    //       name: $('.username').val()
    //     });
    //     emitted = true;
    //   }
    // });
    // $('.chat textarea').keydown(function(){
    //   if(!messageSent) clearTimeout(typingTimer);
    // });
    //
    // function doneTyping(){
    //   // socket.emit('done typing', {
    //   //   name: $('.username').val()
    //   // });
    //   // socket.on('done typing complete', function(data){
    //   // });
    //   $('.typing').html('');
    //   // socket.emit('done typing', {
    //   //   name: $('.username').val()
    //   // });
    //   socket.on('done typing', function(data){
    //     if($('.chat textarea').val().length > 0) $('.typing').html(data.name + ' is typing...');
    //   });
    //   emitted = false;
    // }

    socket.on('function received', function(data){
      switch(data.function){
        case 'clearTyping':
          if($('#' + data.name)) $('#' + data.name).remove();
          typers.splice(typers.indexOf(data.name) > -1, 1);
      }
    });

    socket.on('disconnect', {
      name: $('.username').val()
    });

    socket.on('disconnectioncomplete', function(data){
      $('.chat-log').append('<span class="notice">' + data.name + ' left the chat</span>');
    });
  }
});
