//@ts-check
const EventEmitter = require('events').EventEmitter

const Client = require('minecraft-protocol/src/client')

const customCommunication = {
  sendData: function (data) {
    window.serverDataChannel[this.isServer ? 'emitClient' : 'emitServer'](data)
  },
  receiverSetup: function (processData) {
    window.serverDataChannel[this.isServer ? 'emitServer' : 'emitClient'] = (data) => {
      processData(data)
    }
  }
}

module.exports.customCommunication = customCommunication

module.exports.LocalServer = class LocalServer extends EventEmitter {
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
    this.emit('connection', new Client(true, this.version, this.customPackets, this.hideErrors, customCommunication))
  }

  close () { }
}
