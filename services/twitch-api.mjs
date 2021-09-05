import axios from 'axios'

export class TwitchApi {
  twitchAPIEndpoint = 'https://api.twitch.tv/helix'
  twitchAPIUserEndpoint = `${this.twitchAPIEndpoint}/users`
  twitchAPIStreamEndpoint = `${this.twitchAPIEndpoint}/streams`
  twitchAPIWebhookEndpoint = `${this.twitchAPIEndpoint}/eventsub/subscriptions`

  constructor(config) {
    this.config = config
    this.headers = {
      'Client-ID': this.config.twitchClientId,
      'Authorization': `Bearer ${this.config.twitchAccessToken}`,
      'Content-Type': 'application/json',
    }
  }

  async deleteHooks() {
    try {
      const response = await axios.get(
        this.twitchAPIWebhookEndpoint,
        {
          headers: this.headers
        });
      const subscriptions = response.data.data.map(s => s.id)
      const deletePromises = subscriptions.map(id => {
        return axios.delete(`${this.twitchAPIWebhookEndpoint}?id=${id}`, {
          headers: this.headers
        })
      })
      await Promise.all(deletePromises)
    }
    catch(err) {
      console.error(err)
    }
  }
  /**
   * Registers all webhooks with Twitch directed to this instance of the bot
   */
  async registerWebhooks() {
    this.webhookSecret = "chance_webhook_secret";

    console.log('registering webhooks')
    await this.deleteHooks()
    await this.registerChannelUpdateWebhook();
    await this.registerFollowWebhook();
  }
  async registerChannelUpdateWebhook() {
    try {
      const payload = {
        "type": "channel.update",
        "version": "1",
        "condition": {
            "broadcaster_user_id": this.config.twitchChannelId
        },
        "transport": {
            "method": "webhook",
            "callback": `${process.env.HOST}/webhooks/channelUpdate`,
            "secret": this.webhookSecret
        }
      };
      const response = await axios.post(
        this.twitchAPIWebhookEndpoint,
        payload,
        {
          headers: this.headers
        });
      console.log(`TwitchAPI:registerChannelUpdateWebhook - Response = ${response.status}`);
    } catch (err) {
      if(err.response.status !== 409) {
        console.log(`TwitchAPI:registerChannelUpdateWebhook ${err}`);
      }
      else console.log('TwitchAPI:registerChannelUpdateWebhook - Webhook already exists')
    }
  }
  async registerFollowWebhook() {
    try {
      const payload = {
        "type": "channel.follow",
        "version": "1",
        "condition": {
            "broadcaster_user_id": this.config.twitchChannelId
        },
        "transport": {
            "method": "webhook",
            "callback": `${process.env.HOST}/webhooks/follow`,
            "secret": this.webhookSecret
        }
      };

      const response = await axios.post(
        this.twitchAPIWebhookEndpoint,
        payload,
        {
          headers: this.headers
        });
      console.log(`TwitchAPI:registerFollowWebhook - Response = ${response.status}`);
    } catch (err) {
      if(err.response.status !== 409) {
        console.log(`TwitchAPI:registerFollowWebhook ${err}`);
      }
      else console.log('TwitchAPI:registerFollowWebhook - Webhook already exists')
    }
  }


  /**
   * Retrieves data regarding a Twitch user from the Twitch API
   * @param login username of the user to retrieve
   */
  async getUser(login) {

    const url = `${this.twitchAPIUserEndpoint}?login=${login}`

    let user

    try {
      const response = await axios.get(url, { headers: this.headers })
      if (response.data) {
        const body = response.data
        const userData = body.data.length > 1 ? body.data : body.data[0]
        if (userData) {
          user = new User(userData.login, userData.profile_image_url, userData.id, userData.display_name)
        }
      }
    } catch (err) {
      log(LogLevel.Error, `TwitchAPI:getUser ${err}`)
    }
    return user
  }

  async getStream(streamDate) {

    const url = `${this.twitchAPIStreamEndpoint}?user_id=${this.config.twitchChannelId}&first=1`

    let stream

    try {
      const response = await axios.get(url, { headers: this.headers })
      if (response.data) {
        const body = response.data
        const streamData = body.data.length > 1 ? body.data : body.data[0]
        if (streamData) {
          stream = new Stream(streamData.id, streamData.started_at, streamDate, streamData.title)
        }
      }
    } catch (err) {
      log(LogLevel.Error, `TwitchAPI:getStream ${err}`)
    }

    return stream
  }

  
}