// YOUR CODE HERE:
class Client {

  constructor() {
    this.server = 'https://api.parse.com/1/classes/messages';
    this.lastTimeStamp = undefined;
  }

  init () {
    $('.submit').on('submit', this.handleSubmit);
    $('#chats').on('click', '.username', this.handleUsernameClick);
    this.fetchLatest();
    setInterval(this.fetchLatest.bind(this), 1000);
  }

  send (message) {
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: this.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
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
        console.log(data);
        console.log('chatterbox: Message received');
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to receive message', data);
      }
    });
  }

  fetchLatest () {
    var time = this.lastTimeStamp;
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: this.server,
      type: 'GET',
      data: time ? {'where': `{"updatedAt":{"$gt":"${time}"}}`, 'order': 'updatedAt'} : {'order': '-updatedAt'}, 

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
    $('#chats').append(`<div class="chat"><div class="username">Username:${message.username}</div><div class="message">Message:${message.text}</div></div>`);
  }

  renderRoom(room) {
    $('#roomSelect').append(`<option value=${room}>${room}</option>`);
  }

  displayMessages (data) {
    var renderFunc = this.renderMessage;
    if (!this.lastTimeStamp) { // first time we are retrieving messages
      data.results.reverse();  // messages are in reverse chronological order, we want chronological
    }
    // console.log(data);
    _.each(data.results, function (item) {
      renderFunc(item);
    });
    if (data.results.length > 0) {
      this.lastTimeStamp = data.results[data.results.length - 1].updatedAt;
    }
  }


  handleUsernameClick () {

  }

  handleSubmit () {

  }

}

var app = new Client();

app.init();
// app.fetch();
// app.fetchLatest('2016-03-08T23:26:17.429Z');
// app.fetchRoom('jamesaitest');