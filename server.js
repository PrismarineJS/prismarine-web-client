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

// Start the server
const server = process.argv.includes('--build-only') ? undefined : app.listen(require.main !== module || process.argv[2] === undefined ? 8080 : process.argv[2], function () {
  console.log('Server listening on port ' + server.address().port)
})

module.exports = { app }
