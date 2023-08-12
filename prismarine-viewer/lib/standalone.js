const { Vec3 } = require('vec3')

module.exports = ({ version, world, center = new Vec3(0, 0, 0), viewDistance = 4, port = 3000, prefix = '' }) => {
  const express = require('express')

  const app = express()
  const http = require('http').createServer(app)

  const io = require('socket.io')(http)

  const { setupRoutes } = require('./common')
  setupRoutes(app, prefix)

  const sockets = []
  const viewer = { world }

  async function sendChunks (sockets) {
    const cx = Math.floor(center.x / 16)
    const cz = Math.floor(center.z / 16)

    for (let x = cx - viewDistance; x <= cx + viewDistance; x++) {
      for (let z = cz - viewDistance; z <= cz + viewDistance; z++) {
        const chunk = (await viewer.world.getColumn(x, z)).toJson()
        for (const socket of sockets) {
          socket.emit('loadChunk', { x: x * 16, z: z * 16, chunk })
        }
      }
    }
  }

  viewer.update = () => {
    sendChunks(sockets)
  }

  io.on('connection', (socket) => {
    socket.emit('version', version)
    sockets.push(socket)

    sendChunks([socket])
    socket.emit('position', { pos: center, addMesh: false })

    socket.on('disconnect', () => {
      sockets.splice(sockets.indexOf(socket), 1)
    })
  })

  http.listen(port, () => {
    console.log(`Prismarine viewer web server running on *:${port}`)
  })

  return viewer
}
