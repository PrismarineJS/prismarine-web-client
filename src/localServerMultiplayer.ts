import { Duplex } from 'stream'
import Peer, { DataConnection } from 'peerjs'
import Client from 'minecraft-protocol/src/client'
import { resolveTimeout, setLoadingScreenStatus } from './utils'
import { miscUiState } from './globalState'

class CustomDuplex extends Duplex {
    constructor(options, public writeAction) {
        super(options)
    }

    _read() { }

    _write(chunk, encoding, callback) {
        this.writeAction(chunk)
        callback()
    }
}

let peerInstance: Peer | undefined

export const getJoinLink = () => {
    if (!peerInstance) return
    const url = new URL(window.location.href)
    url.searchParams.set('connectPeer', peerInstance.id)
    url.searchParams.set('peerVersion', localServer.options.version)
    return url.toString()
}

const copyJoinLink = async () => {
    miscUiState.wanOpened = true
    const joinLink = getJoinLink()
    if (navigator.clipboard) {
        await navigator.clipboard.writeText(joinLink)
    } else {
        window.prompt('Copy to clipboard: Ctrl+C, Enter', joinLink)
    }
}

export const openToWanAndCopyJoinLink = async (writeText: (text) => void, doCopy = true) => {
    if (!localServer) return
    if (peerInstance) {
        if (doCopy) await copyJoinLink()
        return 'Already opened to wan. Join link copied'
    }
    const peer = new Peer({
        debug: 3,
    })
    peerInstance = peer
    peer.on('connection', (connection) => {
        console.log('connection')
        const serverDuplex = new CustomDuplex({}, (data) => connection.send(data))
        const client = new Client(true, localServer.options.version, undefined)
        client.setSocket(serverDuplex)
        localServer._server.emit('connection', client)

        connection.on('data', (data: any) => {
            serverDuplex.push(Buffer.from(data))
        })
        // our side disconnect
        const endConnection = () => {
            console.log('connection.close')
            serverDuplex.end()
            connection.close()
        }
        serverDuplex.on('end', endConnection)
        serverDuplex.on('force-close', endConnection)
        client.on('end', endConnection)

        const disconnected = () => {
            serverDuplex.end()
            client.end()
        }
        connection.on('iceStateChanged', (state) => {
            console.log('iceStateChanged', state)
            if (state === 'disconnected') {
                disconnected()
            }
        })
        connection.on('close', disconnected)
        connection.on('error', disconnected)
    })
    peer.on('error', (error) => {
        console.error(error)
        writeText(error.message)
    })
    return new Promise<string>(resolve => {
        peer.on('open', async () => {
            await copyJoinLink()
            resolve('Copied join link to clipboard')
        })
        setTimeout(() => {
            resolve('Failed to open to wan (timeout)')
        }, 5000)
    })
}

export const closeWan = () => {
    if (!peerInstance) return
    peerInstance.destroy()
    peerInstance = undefined
    miscUiState.wanOpened = false
    return 'Closed to wan'
}

export const connectToPeer = async (peerId: string) => {
    setLoadingScreenStatus('Connecting to peer server')
    // todo destroy connection on error
    const peer = new Peer({
        debug: 3,
    })
    await resolveTimeout(new Promise(resolve => {
        peer.once('open', resolve)
    }))
    setLoadingScreenStatus('Connecting to the peer')
    const connection = peer.connect(peerId, {
        serialization: 'raw',
    })
    await resolveTimeout(new Promise<void>((resolve, reject) => {
        connection.once('error', (error) => {
            console.log(error.type, error.name)
            console.log(error)
            reject(error.message);
        })
        connection.once('open', resolve)
    }))

    const clientDuplex = new CustomDuplex({}, (data) => {
        // todo rm debug
        console.debug('sending', data.toString())
        connection.send(data)
    })
    connection.on('data', (data: any) => {
        console.debug('received', Buffer.from(data).toString())
        clientDuplex.push(Buffer.from(data))
    })
    connection.on('close', () => {
        console.log('connection closed')
        clientDuplex.end()
        // bot._client.end()
        // bot.end()
        bot.emit('end', 'Disconnected.')
    })
    connection.on('error', (error) => {
        console.error(error)
        clientDuplex.end()
    })

    return clientDuplex
}
