import { options } from './optionsStorage'

//@ts-check
const { EventEmitter } = require('events')
const debug = require('debug')('minecraft-protocol')
const states = require('minecraft-protocol/src/states')

window.serverDataChannel ??= {}
export const customCommunication = {
  sendData (data) {
    setTimeout(() => {
      window.serverDataChannel[this.isServer ? 'emitClient' : 'emitServer'](data)
    })
  },
  receiverSetup (processData) {
    window.serverDataChannel[this.isServer ? 'emitServer' : 'emitClient'] = (data) => {
      processData(data)
    }
  }
}

class CustomChannelClient extends EventEmitter {
  constructor (isServer, version) {
    super()
    this.version = version
    this.isServer = !!isServer
    this.state = states.HANDSHAKING
  }

  get state () {
    return this.protocolState
  }

  setSerializer (state) {
    customCommunication.receiverSetup.call(this, (/** @type {{name, params, state?}} */parsed) => {
      if (!options.excludeCommunicationDebugEvents.includes(parsed.name)) {
        debug(`receive in ${this.isServer ? 'server' : 'client'}: ${parsed.name}`)
      }
      this.emit(parsed.name, parsed.params, parsed)
      this.emit('packet_name', parsed.name, parsed.params, parsed)
    })
  }

  // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures, grouped-accessor-pairs
  set state (newProperty) {
    const oldProperty = this.protocolState
    this.protocolState = newProperty

    this.setSerializer(this.protocolState)

    this.emit('state', newProperty, oldProperty)
  }

  end (reason) {
    this._endReason = reason
  }

  write (name, params) {
    if(!options.excludeCommunicationDebugEvents.includes(name)) {
      debug(`[${this.state}] from ${this.isServer ? 'server' : 'client'}: ` + name)
      debug(params)
    }

    customCommunication.sendData.call(this, { name, params, state: this.state })
  }

  writeBundle (packets) {
    // no-op
  }

  writeRaw (buffer) {
    // no-op
  }
}

export default CustomChannelClient
