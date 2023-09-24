#!/usr/bin/env node

const express = require('express')
const netApi = require('net-browserify')
const compression = require('compression')
const path = require('path')
const cors = require('cors')
const https = require('https')
const fs = require('fs')

// Create our app
const app = express()

app.use(compression())
app.use(netApi({ allowOrigin: '*' }))
if (process.argv[3] === 'dev') {
  // https://webpack.js.org/guides/development/#using-webpack-dev-middleware
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const config = require('./webpack.dev.js')
  const webpack = require('webpack')
  const compiler = webpack(config)

  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: config.output.publicPath
    })
  )
} else {
  app.use(express.static(path.join(__dirname, './dist')))
}

const portArg = process.argv.indexOf('--port')
const port = require.main === module ? process.argv[2] : (portArg !== -1 ? process.argv[portArg + 1] : 8080)

// Start the server
const server = process.argv.includes('--prod') ?
  undefined :
  app.listen(port, function () {
    console.log('Server listening on port ' + server.address().port)
  })

module.exports = { app }
