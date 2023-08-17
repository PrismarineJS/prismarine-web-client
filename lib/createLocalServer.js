import mcServer from 'space-squid'
import LocalServer from './customServer'

export const serverOptions = {
  'motd': 'A Minecraft Server \nRunning flying-squid',
  // host: '',
  customPackets: true,
  'port': 25565,
  'max-players': 10,
  'online-mode': false,
  'gameMode': 1,
  'difficulty': 0,
  'worldFolder': 'world',
  // todo set sid, disable entities auto-spawn
  'generation': {
    // grass_field
    // diamond_square
    // empty
    // superflat
    // all_the_blocks
    // nether
    'name': 'diamond_square',
    options: {}
    // 'options': {
    //   'worldHeight': 80
    // }
  },
  'kickTimeout': 10000,
  'plugins': {},
  'modpe': false,
  'view-distance': 2,
  'player-list-text': {
    'header': 'Flying squid',
    'footer': 'Test server'
  },
  'everybody-op': true,
  'max-entities': 100,
  'version': '1.16.1',
  Server: LocalServer
}

export const startLocalServer = () => {
  const server = mcServer.createMCServer(serverOptions)
  return server
}
