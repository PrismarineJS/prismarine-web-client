#!/usr/bin/env node

const express = require('express')
const netApi = require('net-browserify')
const compression = require('compression')
const path = require('path')

// Create our app
const app = express()

app.use(compression())
app.use(netApi({ allowOrigin: '*' }))
app.use(express.static(path.join(__dirname, './public')))
app.use(express.json({ limit: '100kb' }))

// Start the server
const server = app.listen(process.argv[2] === undefined ? 8080 : process.argv[2], function () {
  console.log('Server listening on port ' + server.address().port)
})
