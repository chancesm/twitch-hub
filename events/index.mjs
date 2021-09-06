import {EventEmitter} from 'events'

export class EventBus {

  static eventEmitter = new EventEmitter()

}
export const EventEnums = {
  CHANNEL_UPDATE : 'CHANNEL_UPDATE',
  NEW_FOLLOWER : 'NEW_FOLLOWER'
}