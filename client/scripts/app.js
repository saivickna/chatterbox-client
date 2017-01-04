// YOUR CODE HERE:
var sheet;
var escapeHtml = function(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML.replace(/'/g, '\'');
};

class Client {

  constructor() {
    this.server = 'https://api.parse.com/1/classes/messages';
    this.lastTimeStamp = undefined;
    this.currentRoom = 'lobby';
    this.roomList = [this.currentRoom];
    this.newRoom = undefined;
  }

  init () {
    $('.submit').on('click', this.handleSubmit.bind(this));
    $('#roomSelect').on('change', this.changeRoom.bind(this));
    $('#createRoom').on('click', this.createRoom.bind(this));
    $('#chats').on('click', '.username', this.handleUsernameClick);
    var thisApp = this;
    $('#tabList').on('click', '.roomTab', function () {
      thisApp.changeTab.call(this, thisApp); 
    });
    $('#tabList').on('click', '.glyphicon-remove-circle', this.removeTab);

    $('#addTab').on('click', function () {
      thisApp.addTab.call(this, thisApp); 
    });
    $('#message').keyup(function(event) {
      if (event.keyCode === 13) {
        $('.submit').click();
      }
    });
    this.changeRoom();
    this.fetchLatest();
    setInterval(this.fetchLatest.bind(this), 1000);
    this.fetchRoomList();
    setInterval(this.fetchRoomList.bind(this), 3000);
    // this.fetchRoom('jamesai');
    // setInterval(this.fetchRoom.bind(this, 'jamesai'), 1000);
  }

  send (message) {
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: this.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        $('#message').val('');
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message', data);
      }
    });
  }

  fetch () {
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: this.server,
      type: 'GET',
      contentType: 'application/json',
      success: function (data) {
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to receive message', data);
      }
    });
  }

  // fetchRoom (room) {
  //   var time = this.lastTimeStamp;
  //   $.ajax({
  //     // This is the url you should use to communicate with the parse API server.
  //     url: this.server,
  //     type: 'GET',
  //     data: {'where': `{"roomname":"${room}"}`, 'order': 'updatedAt'}, 
  //     contentType: 'application/json',
  //     success: this.displayMessages.bind(this),
  //     error: function (data) {
  //       // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
  //       console.error('chatterbox: Failed to receive message', data);
  //     }
  //   });
  // }

  fetchRoomList (room) {
    if (!$('#roomSelect').is(':focus')) {
      $.ajax({
        // This is the url you should use to communicate with the parse API server.
        url: this.server,
        type: 'GET',
        data: {'keys': 'roomname', 'order': '-updatedAt', 'limit': '1000'}, 
        contentType: 'application/json',
        success: this.updateRoomList.bind(this),
        error: function (data) {
          // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
          console.error('chatterbox: Failed to receive message', data);
        }
      });
    }
    
  }
  fetchLatest () {
    var time = this.lastTimeStamp;
    var room = this.currentRoom;
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: this.server,
      type: 'GET',
      data: time ? {'where': `{"updatedAt":{"$gt":"${time}"}, "roomname":"${room}"}`, 'order': 'updatedAt'} : {'where': `{"roomname":"${room}"}`, 'order': '-updatedAt'}, 

      // data: {"order":"-createdAt", "group": "chatroom"},
      contentType: 'application/json',
      success: this.displayMessages.bind(this),
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to receive message', data);
      }
    });
  }

  clearMessages() {
    $('#chats').empty();
  }


  renderMessage(message) {
    var test = $('#chats').append(`<div class="chat ${escapeHtml(message.username)} alert alert-warning"><a href="#" class="username">${escapeHtml(message.username)}</a><div class="message">${escapeHtml(message.text)}</div></div>`);
  }

  renderRoom(room) {
    $('#roomSelect').append(`<option value="${room}">${room}</option>`);
  }

  updateRoomList (data) {
    var renderRoomFunc = this.renderRoom;
    var roomListArr = this.roomList;
    _.each(data.results, function (item) {
      if (!roomListArr.includes(escapeHtml(item.roomname))) {
        roomListArr.push(escapeHtml(item.roomname));
        renderRoomFunc(escapeHtml(item.roomname));
      }
      // if ($(`#roomSelect option:contains('${escapeHtml(item.roomname)}')`).length === 0) {
        
      // }
    });
    this.roomList = roomListArr;
    if (this.newRoom) {
      if (this.roomList.includes(this.newRoom)) {
        var sel = document.getElementById('roomSelect');
        var opts = sel.options;
        for (var i = 0; i < opts.length; i++) {
          if (opts[i].value === this.newRoom) {
            sel.selectedIndex = i;
            break;
          }
        }
        this.changeRoom();
        this.newRoom = undefined;
      }
    }
  }

  displayMessages (data) {
    var renderFunc = this.renderMessage;
    if (!this.lastTimeStamp) { // first time we are retrieving messages
      data.results.reverse();  // messages are in reverse chronological order, we want chronological
    }
    _.each(data.results, function (item) {
      renderFunc(item);  
    });
    if (data.results.length > 0) {
      this.lastTimeStamp = data.results[data.results.length - 1].updatedAt;
      $('#chats').scrollTop($('#chats')[0].scrollHeight);
    }
  }


  handleUsernameClick (event) {
    var ruleExists = false; 
    for (var i = 0; i < sheet.cssRules.length; i++) {
      if (sheet.cssRules[i].selectorText === `.${$(this).text()}`) {        
        ruleExists = true; //indicates the rule already exists meaning we have already clicked on the friend once
        sheet.deleteRule (i);
      }
    }  
    if (!ruleExists) {
      sheet.insertRule(`.${$(this).text()} { color: #3c763d; background-color: #dff0d8; border-color: #b2dba1}`, sheet.cssRules.length);
      // sheet.insertRule(`.${$(this).text()} { .alert-success }`, sheet.cssRules.length);
    }
  }

  handleSubmit () {  
    var message = {
      username: window.location.search.split('=')[1],
      roomname: this.currentRoom,
      text: $('#message').val()
    }; 
    this.send(message);
  }

  changeRoom () {
    this.currentRoom = $('#roomSelect').val();
    $('.active a').text(escapeHtml(this.currentRoom));
    this.lastTimeStamp = undefined;
    this.clearMessages();
  }

  createRoom () {
    var room = prompt('Enter room name') || 'new room';
    var message = {
      username: window.location.search.split('=')[1],
      roomname: room,
      text: `I created a new room: ${room}`
    }; 
    this.newRoom = room;
    this.send(message);
  }

  addTab(thisApp) {
    $('.active').removeClass('active');
    $(this).before(`<li role="presentation" class="active roomTab"><a href="#">${thisApp.currentRoom}</a><span class="glyphicon glyphicon-remove-circle" aria-hidden="true"></span></li>`);
  }

  // changeDropDrop (value)
  changeTab(thisApp) {
    $('.active').removeClass('active');
    //this.currentRoom = $(this).text();
    var sel = document.getElementById('roomSelect');
    var opts = sel.options;
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].value === $(this).find('a').text()) {
        sel.selectedIndex = i;
        break;
      }
    }
    thisApp.changeRoom();
    $(this).addClass('active');
    // $(this).before(`<li role="presentation" class="active roomTab">${this.currentRoom}</li>`);
  }

  removeTab(event) {
    event.stopPropagation();
    var tabList = $(this).closest('ul');
    if (tabList.children().length > 2) {
      var closest = $(this).closest('li');
      if (closest.hasClass('active')) {
        closest.remove();
        // console.log($('roomTab').first());
        $('.roomTab').first().click();
      } else {
        closest.remove();
      }


    }

  }
}




$(document).ready(function() {
  //sheet = document.styleSheets[0];

  sheet = (function() {
  // Create the <style> tag
    var style = document.createElement('style');

    // WebKit hack :(
    style.appendChild(document.createTextNode(''));

    // Add the <style> element to the page
    document.head.appendChild(style);

    return style.sheet;
  })();
  var app = new Client();
  app.init();  
});


// app.fetch();
// app.fetchLatest('2016-03-08T23:26:17.429Z');
// app.fetchRoom('jamesaitest');