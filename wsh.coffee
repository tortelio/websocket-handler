module.exports = class WebSocketHandler

  waitingForConnection: (callback, interval) ->
    if ws.readyState is 1
      callback()
    else
      setTimeout( =>
        @waitingForConnection callback, interval
      , interval)

  ws = null
  constructor: (hostname) ->
    ws = new WebSocket hostname
    @events = {}
    ws.addEventListener "message", @onmessage

  send: (msg) ->
    message = JSON.stringify msg
    @waitingForConnection( ->
      ws.send message
    , 200)

  onmessage: (e) =>
    data = JSON.parse e.data
    @dispatchEvent data.type, data

  registerEvent: (eventName) ->
    @events[eventName] = new Event eventName

  addEventListener: (eventName, callback) ->
    unless @events.hasOwnProperty eventName
      @registerEvent eventName
    @events[eventName].registerCallback callback

  removeEventListener: (eventName, callback) ->
    if @events.hasOwnProperty eventName
      index = @events[eventName].callbacks.indexOf callback
      if index is -1
        console.error "You tried to remove an unregistered callback function from \"#{eventName}\" event!"
      else
        if @events[eventName].callbacks.length is 1
          delete @events[eventName]
        else
          @events[eventName].callbacks[index] = @event[eventName].callbacks.pop()
    else
      console.error "\"#{eventName}\" event is not registered in handler!"

  dispatchEvent: (eventName, eventArgs) ->
    if @events.hasOwnProperty eventName
      @events[eventName].callbacks.map (cb) ->
        cb(eventArgs)
    else
      console.error "\"#{eventName}\" event is not registered in handler!"

class Event
  constructor: (name) ->
    @callbacks = []

  registerCallback: (callback) ->
    @callbacks.push callback

# Custom eventListener: http://stackoverflow.com/questions/15308371/custom-events-model-without-using-dom-events-in-javascript
