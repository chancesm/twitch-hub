import {EventEmitter} from 'events'

export class EventBus {

  static eventEmitter = new EventEmitter()

}
export const EventEnums = {
  CHANNEL_UPDATE : 'CHANNEL_UPDATE_EVENT',
  NEW_FOLLOWER : 'NEW_FOLLOWER'
}