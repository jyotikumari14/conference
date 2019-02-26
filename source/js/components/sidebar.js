/** @jsx React.DOM */

define([
  'react',
  'utils',
  'constants',
  'configs',
  'skylink',
  'marked'

], function (
  React,
  Utils,
  Constants,
  Configs,
  Skylink,
  Marked
) {

  /**
   * The chat component.
   * @class Chat
   */
  var Sidebar = React.createClass({displayName: 'Sidebar',
    marked: Marked,

    /**
     * Handles when the chatbox is in focus.
     * @method handleFocus
     * @for Chat
     */
    handleFocus: function(e) {
      // Ignore the press event action for <a href></a>.
      if (e.target.tagName === 'A') {
        return;
      }

      Dispatcher.toggleControls(false);
      Dispatcher.toggleChat();
    },

    /**
     * Handles sending chat message.
     * @method handleSendMessage
     * @for Chat
     */
    handleSendMessage: function(e) {
      if(!e.keyCode || e.keyCode === 13) {
        var message = e.currentTarget.value;

        Skylink.sendMessage({
          content: message,
          date: (new Date()).toISOString()
        });

        e.currentTarget.value = '';
        Dispatcher.toggleControls(false);
      }
    },

    componentDidUpdate: function() {
      var cont = document.getElementById('messages');
      // Scroll to bottom latest message received when chat component updates.
      if(cont) {
        cont.scrollTop = cont.scrollHeight;
      }
    },

    render: function() {
      var app = this;

      // Render chat UI as offline state when self is not in the room.
      if(app.props.state.state !== Constants.AppState.IN_ROOM) {
        return (React.DOM.section({id: "chat", className: "offline"}));
      }

      var outputHTML = [];

      Utils.forEach(app.props.state.room.messages, function (message) {
        var userName = 'User "' +  message.userId + '"';
        var className = 'message';

        className += message.userId === 'self' ? ' you' : '';
        className += message.type === Constants.MessageType.ACTION ? ' action' : '';

        if (message.userId === 'getaroom.io') {
          userName = 'getaroom.io';

        } else if (message.userId === 'MCU') {
          userName = 'MCU';

        } else {
          userName = (app.props.state.users[message.userId] || {}).name || userName;
        }

        outputHTML.push(
          React.DOM.div({key: message.date, className: className}, 
              React.DOM.span({className: "name"}, userName), 
              React.DOM.span({className: "body", dangerouslySetInnerHTML: {__html: app.marked(message.content)}})
          )
        );
      });

      return (
        React.DOM.section({id: "chat"}, 
            React.DOM.div(null, 
                React.DOM.div({id: "messages", onClick: app.handleFocus}, 
                    React.DOM.div(null, outputHTML)
                ), 
                React.DOM.div({id: "input", className: app.props.state.room.status !== Constants.RoomState.CONNECTED ? 'disabled' : ''}, 
                    React.DOM.input({id: "messageInput", type: "text", placeholder: "Chat message", autoComplete: "off", onKeyDown: app.handleSendMessage})
                )
            )
        )
      )
    }

  });

  return Sidebar;
});