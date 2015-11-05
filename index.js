"use strict";

var Event = require("./event.js");

module.exports = class WebSocketHandler {
  constructor(host) {
    this.host = host;
    this.ws = new WebSocket(this.host);
    this.events = []

    var onmessage = (function(_this) {
      return function(e) {
        var data = JSON.parse(e.data);
        _this.dispatchEvent(data)
      }
    })(this);

    this.ws.addEventListener("message", onmessage);
  }

  // TODO
  waiting(callback, interval) {
    if(this.ws.readyState == 1) {
      return callback()
    }
    setTimeout((() => this.waiting(callback, interval)), interval);
  }

  send(msg) {
    var message = JSON.stringify(msg);
    this.waiting((() => this.ws.send(message)), 500);
  }

  registerEvent(eventName) {
    if(this.events.hasOwnProperty(eventName)) {
      console.error(`${eventName} event is already registered!`);
    } else {
      this.events[eventName] = new Event(eventName);
    }
  }

  addEventListener(eventName, callback) {
    if(! this.events.hasOwnProperty(eventName)) {
      this.registerEvent(eventName)
    }
    this.events[eventName].registerCallback(callback);
  }

  removeEventListener(eventName, callback) {
    if(this.events.hasOwnProperty(eventName)) {
      var index = this.events[eventName].callbacks.indexOf(callback);
      if(index == -1) {
        console.error(`You tried to remove an unregistered callback function from ${eventName} event!`);
      } else {
        if(this.events[eventName].callbacks.length == 1) {
          delete this.events[eventName]
        } else {
          this.events.callbacks[index] = this.events[eventName].callbacks.pop()
        }
      }
    } else {
      console.error(`${eventName} event is not registered in handler!`);
    }
  }

  dispatchEvent(data) {
    if(this.events.hasOwnProperty(data.type)) {
      this.events[data.type].callbacks.map(((callback) => callback(data)));
    } else {
      console.error(`${data.type} event is not registered in handler!`);
    }
  }
}
