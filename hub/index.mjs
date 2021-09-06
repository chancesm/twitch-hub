// NOTE : https://github.com/socketio/socket.io/issues/3676#issuecomment-723517514
// This is where events get mapped to actions!
// All of the utilities in this service utilize the EventBus and all events eventually make it HERE
// Here we listen to the event on the EventBus and decide what to do with it: Send it via a websocket or handle with another service
// Currently the only option is to pass the event along through the websocket service to the overlays,
// but we can easily implement more options (trigger lights, play sounds, etc.)
import { Server } from 'socket.io'

import { EventBus, EventEnums } from '../events/index.mjs'
const exclusions = [
  EventEnums.NEW_FOLLOWER
]
export class IO {
  io = null
  constructor(server) {
    this.io = new Server(server)
    this.io.on("connection", (socket) => {
      console.log('new socket', socket.id)
       // when the user disconnects.. perform this
      socket.on('disconnect', () => {
        console.log(`socket: ${socket.id} - disconnected`)
      });
    })
    EventBus.eventEmitter.addListener(EventEnums.CHANNEL_UPDATE, (payload) => this.onChannelUpdate(payload))
  }
  onChannelUpdate(payload) {
    console.log('Channel Updated', payload.event.title)
    this.io.emit(EventEnums.CHANNEL_UPDATE, payload)
  }
  
}