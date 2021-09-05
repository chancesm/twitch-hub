import express from 'express'

export const overlayRouter = express.Router()

// Serve up the basic HTML & compiled JS/SCSS
overlayRouter.use(
  express.static('web/overlays')
)

