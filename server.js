#!/usr/bin/env node

const express = require('express')
const netApi = require('net-browserify')
const compression = require('compression')
const path = require('path')

// Create our app
const app = express()

app.get('/config.json', (_, res) => res.sendFile(path.join(__dirname, 'config.json')))

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
  app.use(express.static(path.join(__dirname, './public')))
}

// Start the server
const server = app.listen(process.argv[2] === undefined ? 8080 : process.argv[2], function () {
  console.log('Server listening on port ' + server.address().port)
})
