import { Duplex } from 'stream'
import Peer, { DataConnection } from 'peerjs'
import Client from 'minecraft-protocol/src/client'
import { resolveTimeout, setLoadingScreenStatus } from './utils'
import { miscUiState } from './globalState'

class CustomDuplex extends Duplex {
    constructor(options, public writeAction) {
        super(options)
    }

    // Implement the _read() method for reading data from the stream
    _read(size) {
    }

    // Implement the _write() method for writing data to the stream
    _write(chunk, encoding, callback) {
        this.writeAction(chunk)
        // this.writeStream.push(chunk) // Push the data chunk to the write queue
        // this.writeStream.resume() // Resume the write stream
        callback() // Signal that the write operation is complete
    }
}

let peerInstance: Peer | undefined

const copyJoinLink = async (id) => {
    miscUiState.wanOpened = true
    const url = new URL(window.location.href)
    url.searchParams.set('connectPeer', id)
    url.searchParams.set('peerVersion', localServer.options.version)
    await navigator.clipboard.writeText(url.toString())
}

export const openToWanAndCopyJoinLink = async (writeText: (text) => void) => {
    if (!localServer) return
    if (peerInstance) {
        await copyJoinLink(peerInstance.id)
        return 'Already opened to wan. Join link copied'
    }
    const peer = new Peer({
        debug: 3,
    })
    peerInstance = peer
    peer.on('connection', (connection) => {
        console.log('connection')
        const serverDuplex = new CustomDuplex({}, (data) => connection.send(data))
        const client = new Client(true, localServer.options.version, undefined, false, undefined, /* true */);
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
        };
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
    return await new Promise<string>(resolve => {
        peer.on('open', async (id) => {
            await copyJoinLink(id)
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
            return reject(error.message);
        })
        connection.once('open', resolve)
    }))

    const clientDuplex = new CustomDuplex({}, (data) => {
        // todo rm debug
        console.debug('sending', data.toString())
        connection.send(data);
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
