"use strict";

module.exports = class Event {
  constructor(name) {
    this.callbacks = [];
  }

  registerCallback(callback) {
    this.callbacks.push(callback);
  }
}
