'use strict';

var React = window.React = require('react');
var StyleSheet = require('react-style');
var SessionActions = require('../actions/SessionActions.js');
var SessionStore = require('../stores/SessionStore.js');

var Session = React.createClass({
  getInitialState: function() {
    return { session: SessionStore.getSession() }
  },
  componentDidMount: function() {
      var session = OT.initSession(this.state.session.key, this.state.session.sessionId);
     session.connect(this.state.session.token, function(error) {
      if (error) {
        console.log(error.message);
      } else {
        var pubElem = document.createElement('div');
         var publisher = OT.initPublisher(pubElem, {
          resolution: '1280x720'
        }, function(err) {
          if (err) console.error(err);
          session.publish(publisher);
          // layoutContainer.appendChild(pubElem);
          // layout();
          // localStorageService.set('publisher', publisher);
          // ctrl.pubCallback();
        });
        // console.log("session connected, publish the stream");
      }
    });
  },
  render: function() {
    return (
      <div styles={styles.container}>
        <p styles={styles.logo}>Video</p>        
      </div>
    )
  },
});

var styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 60,
    left: 0,
    right: 0,
    width: 400,
    height: 300,
    margin: 'auto',
    textAlign: 'center'
  },
  logo: {
    position: 'relative',
    fontFamily: 'poiret_oneregular',
    textAlign: 'center',
    fontSize: 64,
    color: 'rgba(225, 225, 225, .6)',
    fontWeight: 300,
    marginBottom: 0
  }
});

module.exports = Session;
