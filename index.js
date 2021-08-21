import http from 'http'
import axios from 'axios'
import qs from 'querystring'
import dotenv from 'dotenv'
dotenv.config()
// Identify the Twitch credentials first
const TWITCH_API = 'https://id.twitch.tv/oauth2/token'
const TwitchClientId = process.env.TWITCH_CLIENT_ID
const TwitchClientSecret = process.env.TWITCH_CLIENT_SECRET

import { join, dirname } from 'path'
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use JSON file for storage
const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

// Read data from JSON file, this will set db.data content
await db.read()

// If file.json doesn't exist, db.data will be null
// Set default data
// db.data ||= { posts: [] }
db.data = db.data || { twitch: { auth: null} } // for node < v15.x

if(db.data.twitch.auth === null) {
  console.log('Please authenticate with twitch')
}
const authParams = qs.stringify({
  client_id: TwitchClientId,
  client_secret: TwitchClientSecret,
  grant_type: 'client_credentials',
  scope: 'channel:moderate chat:edit chat:read'
})
const url = `${TWITCH_API}?${authParams}`
console.log(url)
axios.post(`${TWITCH_API}?${authParams}`)
.then(init)
.catch((reason) => console.log(reason))

async function init(response) {
  console.log('Twitch creds verified')
  console.log(response.data)
  // await db.write()
}