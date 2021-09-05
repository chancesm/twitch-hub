// Node Libraries
import axios from 'axios'
import dotenv from 'dotenv'
import express from 'express'
import http from 'http'
import morgan from 'morgan'
import qs from 'querystring'
dotenv.config()

// Local Imports
import { IO } from './hub/index.mjs'
import { TwitchApi } from './services/twitch-api.mjs'
import { webhookRouter } from './webhooks/index.mjs'
import { overlayRouter } from './web/index.mjs'
// Identify the Twitch credentials first
const TWITCH_API = 'https://id.twitch.tv/oauth2/token'
const TwitchClientId = process.env.TWITCH_CLIENT_ID
const TwitchClientSecret = process.env.TWITCH_CLIENT_SECRET

const authParams = qs.stringify({
  client_id: TwitchClientId,
  client_secret: TwitchClientSecret,
  grant_type: 'client_credentials',
  scope: 'channel:moderate chat:edit chat:read'
})

axios.post(`${TWITCH_API}?${authParams}`)
.then(init)
.catch((reason) => console.log(reason))

async function init(response) {
  const twitchAuth = response.data
  const config = {
    twitchClientId: TwitchClientId,
    twitchChannel: process.env.TWITCH_CHANNEL,
    twitchAccessToken: twitchAuth.access_token,
    twitchBotName: process.env.TWITCH_BOT_USERNAME,
    twitchBotToken: process.env.TWITCH_BOT_AUTH_TOKEN,
    twitchChannelId: process.env.TWITCH_CHANNEL_ID,
  }
  const app = express()
  const server = http.createServer(app)
  const io = new IO(server)
  
  app.use(express.json())
  app.use(morgan('dev'))
  app.use('/webhooks', webhookRouter)
  app.use('/overlays', overlayRouter)
  server.listen((process.env.PORT || 3000), () => {
    console.log('webserver listening')
  })

  const twitchApi = new TwitchApi(config)
  await twitchApi.registerWebhooks()

}