// NOTE : https://github.com/socketio/socket.io/issues/3676#issuecomment-723517514

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
    })
    EventBus.eventEmitter.addListener(EventEnums.CHANNEL_UPDATE, (payload) => this.onChannelUpdate(payload))
  }
  onChannelUpdate(payload) {
    console.log('Channel Updated', payload.event.title)
    this.io.emit(EventEnums.CHANNEL_UPDATE, payload)
  }
  
}