import express from 'express'
import CryptoJS from 'crypto-js'
import { EventBus, EventEnums } from '../events/index.mjs'
export const webhookRouter = express.Router()

const emit = (event, payload) => {
  EventBus.eventEmitter.emit(event, payload)
}

const verifySignature = (req,res,next) => {
  const hmac_message = req.headers['Twitch-Eventsub-Message-Id'] + req.headers['Twitch-Eventsub-Message-Timestamp'] + JSON.stringify(req.body)
  const hash = CryptoJS.HmacSHA256(hmac_message, 'chance_webhook_secret')
  const expected_signature_header = 'sha256=' + hash

  if (req.headers['Twitch-Eventsub-Message-Signature'] != expected_signature_header) {
    next()
  }
  else {
    res.sendStatus(403)
  }
}

webhookRouter.post('/channelUpdate', verifySignature, async (req, res) => {
  // console.log({
  //   HEADERS: request.headers,
  //   BODY: request.body,
  // })
  if(req.body.challenge) {
    res.status(200).send(req.body.challenge)
  }
  else {
    emit(EventEnums.CHANNEL_UPDATE, req.body)
    res.sendStatus(200)
  }
})

webhookRouter.post('/follow', verifySignature, async (request, response) => {
  if(request.body.challenge) {
    response.status(200).send(request.body.challenge)
  }
  else {
    console.log({
      HEADERS: request.headers,
      BODY: request.body,
    })
    emit(EventEnums.NEW_FOLLOWER, req.body)
    response.sendStatus(200)
  }
})
