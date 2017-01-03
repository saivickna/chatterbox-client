// YOUR CODE HERE:
class Client {

  constructor() {
    this.server = 'https://api.parse.com/1/classes/messages';
    this.lastTimeStamp = '';
  }

  init () {
    $('.submit').on('submit', this.handleSubmit);
    $('#chats').on('click', '.username', this.handleUsernameClick);
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

  fetchLatest (time) {
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: this.server,
      type: 'GET',
      data: `where={"updatedAt":{"$gt":"${time}"}},order:"updatedAt"`,
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

  }


  handleUsernameClick () {

  }

  handleSubmit () {

  }

}

var app = new Client();
//app.fetch();
app.fetchLatest('2016-03-08T23:26:17.429Z');
//app.fetchRoom('jamesaitest');