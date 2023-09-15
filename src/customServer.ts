import EventEmitter from 'events'

import Client from 'minecraft-protocol/src/client'

window.serverDataChannel ??= {}
export const customCommunication = {
  sendData(data) {
    //@ts-ignore
    window.serverDataChannel[this.isServer ? 'emitClient' : 'emitServer'](data)
  },
  receiverSetup(processData) {
    //@ts-ignore
    window.serverDataChannel[this.isServer ? 'emitServer' : 'emitClient'] = (data) => {
      processData(data)
    }
  }
}

export class LocalServer extends EventEmitter.EventEmitter {
  socketServer = null
  cipher = null
  decipher = null
  clients = {}

  constructor(public version, public customPackets, public hideErrors = false) {
    super()
  }

  listen() {
    this.emit('connection', new Client(true, this.version, this.customPackets, this.hideErrors, customCommunication))
  }

  close() { }
}
