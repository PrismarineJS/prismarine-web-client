//@ts-check
import mcServer from 'flying-squid'
import serverOptions from './defaultLocalServerOptions'
import { LocalServer } from './customServer'

export const startLocalServer = () => {
  const server = mcServer.createMCServer({ ...serverOptions, Server: LocalServer })
  return server
}

// features that flying-squid doesn't support at all
// todo move & generate in flying-squid
export const unsupportedLocalServerFeatures = ['transactionPacketExists', 'teleportUsesOwnPacket', 'dimensionDataIsAvailable']
