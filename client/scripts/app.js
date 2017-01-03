// YOUR CODE HERE:

var escapeHtml = function(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML.replace(/'/g, '"');
};

class Client {

  constructor() {
    this.server = 'https://api.parse.com/1/classes/messages';
    this.lastTimeStamp = undefined;
    this.currentRoom = 'lobby';
    this.roomList = [];
  }

  init () {
    $('.submit').on('click', this.handleSubmit.bind(this));
    $('#roomSelect').on('change', this.changeRoom.bind(this));
    $('#chats').on('click', '.username', this.handleUsernameClick);
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
        console.log('chatterbox: Message sent');
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
        console.log('chatterbox: Message received');
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
    $('#chats').append(`<div class="chat"><div class="username">Username:${escapeHtml(message.username)}</div><div class="message">Message:${escapeHtml(message.text)}</div></div>`);
  }

  renderRoom(room) {
    $('#roomSelect').append(`<option value=${room}>${room}</option>`);
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


  handleUsernameClick () {

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
    this.lastTimeStamp = undefined;
    this.clearMessages();
  }
}

$(document).ready(function() {
  var app = new Client();
  app.init();  
});


// app.fetch();
// app.fetchLatest('2016-03-08T23:26:17.429Z');
// app.fetchRoom('jamesaitest');