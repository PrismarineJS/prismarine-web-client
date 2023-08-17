//@ts-check
const EventEmitter = require('events').EventEmitter

// const Client = require('./customClient')
// todo it actually uses patched client
const Client = require('minecraft-protocol/src/client')

module.exports = class LocalServer extends EventEmitter {
  constructor (version, customPackets, hideErrors = false) {
    super()
    this.version = version
    this.socketServer = null
    this.cipher = null
    this.decipher = null
    this.clients = {}
    this.customPackets = customPackets
    this.hideErrors = hideErrors
  }

  listen () {
    this.emit('connection', new Client(true, this.version, this.customPackets, this.hideErrors))
  }

  close () { }
}
