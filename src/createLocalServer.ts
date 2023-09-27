//@ts-check
import mcServer from 'flying-squid'
import serverOptions from './defaultLocalServerOptions'
import { LocalServer } from './customServer'

export const startLocalServer = () => {
  const passOptions = { ...serverOptions, Server: LocalServer }
  const server = mcServer.createMCServer(passOptions)
  server.formatMessage = (message) => `[server] ${message}`
  server.options = passOptions
  return server
}

// features that flying-squid doesn't support at all
// todo move & generate in flying-squid
export const unsupportedLocalServerFeatures = ['transactionPacketExists', 'teleportUsesOwnPacket', 'dimensionDataIsAvailable']
