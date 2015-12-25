'use strict';

var React = window.React = require('react');
var StyleSheet = require('react-style');
var SessionActions = require('../actions/SessionActions.js');
var SessionStore = require('../stores/SessionStore.js');

var Session = React.createClass({
  getInitialState: function() {
    return {
      session: SessionStore.getSession()
    }
  },
  componentDidMount: function() {
    FB.ui({
      method: 'feed',
      link: 'https://developers.facebook.com/docs/',
      caption: 'An example caption',
    }, function(response) {
      console.log('response', response);
    });
    var session = OT.initSession(this.state.session.key, this.state.session.sessionId);
    this.registerEvents(session);
    session.connect(this.state.session.token, function(error) {
      if (error) {
        console.log(error.message);
      } else {
        var opts = {
          Animator: {
            duration: 500,
            easing: 'swing'
          },
          bigFixedRatio: false
        };
        var layoutContainer = document.getElementById('layoutContainer');
        var layout = initLayoutContainer(layoutContainer, opts).layout;
        session.publish("publisherContainer");
        layout();
        var resizeTimeout;
        window.onresize = function() {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(function() {
            layout();
          }, 20);
        };
      }
    });
  },

  registerEvents: function(session) {
    var connectionCount = 0;
    session.on({
      connectionCreated: function(event) {
        connectionCount++;
        console.log(connectionCount + ' connections.');
      },
      connectionDestroyed: function(event) {
        connectionCount--;
        console.log(connectionCount + ' connections.');
      },
      sessionDisconnected: function sessionDisconnectHandler(event) {
        console.log('Disconnected from the session.', event.reason);
      }
    });
  },
  render: function() {
    return (
      <div id='layoutContainer'>
         <div id="publisherContainer"></div>
      </div>
    )
  },
});


module.exports = Session;