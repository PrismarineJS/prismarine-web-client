const express = require('express')
const netApi = require('net-browserify')
const bodyParser = require('body-parser')
const request = require('request')
const compression = require('compression')

// Create our app
const app = express()

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE')
  res.header('Access-Control-Expose-Headers', 'Content-Length')
  res.header(
    'Access-Control-Allow-Headers',
    'Accept, Authorization, Content-Type, X-Requested-With, Range'
  )
  if (req.method === 'OPTIONS') {
    return res.send(200)
  } else {
    return next()
  }
})

app.use(compression())
app.use(netApi())
app.use(express.static('./public'))

app.use(bodyParser.json({ limit: '100kb' }))

app.all('*', function (req, res, next) {
  // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, PUT, PATCH, POST, DELETE')
  res.header(
    'Access-Control-Allow-Headers',
    req.header('access-control-request-headers')
  )

  if (req.method === 'OPTIONS') {
    // CORS Preflight
    res.send()
  } else {
    const targetURL = req.header('Target-URL')
    if (!targetURL) {
      res.status(404).send({ error: '404 Not Found' })
      return
    }
    const newHeaders = req.headers
    newHeaders.host = targetURL
      .replace('https://', '')
      .replace('http://', '')
      .split('/')[0]
    request(
      {
        url: targetURL + req.url,
        method: req.method,
        json: req.body,
        headers: req.headers
      },
      function (error, response, body) {
        if (error) {
          console.error(error)
          console.error('error: ' + response.statusCode)
        }
        //                console.log(body);
      }
    ).pipe(res)
  }
})

// Start the server
const server = app.listen(8080, function () {
  console.log('Server listening on port ' + server.address().port)
})
