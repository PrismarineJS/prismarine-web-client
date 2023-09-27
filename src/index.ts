/* eslint-disable import/order */
import './importsWorkaround'
import './styles.css'
import './globals'
import 'iconify-icon'
import './chat'
import './inventory'

import './menus/components/button'
import './menus/components/edit_box'
import './menus/components/slider'
import './menus/components/hotbar'
import './menus/components/health_bar'
import './menus/components/food_bar'
import './menus/components/breath_bar'
import './menus/components/debug_overlay'
import './menus/components/playerlist_overlay'
import './menus/components/bossbars_overlay'
import './menus/hud'
import './menus/play_screen'
import './menus/pause_screen'
import './menus/loading_or_error_screen'
import './menus/keybinds_screen'
import './menus/options_screen'
import './menus/advanced_options_screen'
import { notification } from './menus/notification'
import './menus/title_screen'
import { initWithRenderer, statsEnd, statsStart } from './rightTopStats'

import { options, watchValue } from './optionsStorage'
import './reactUi.jsx'
import { contro } from './controls'
import './dragndrop'
import './browserfs'
import './eruda'
import './watchOptions'
import downloadAndOpenFile from './downloadAndOpenFile'

import net from 'net'
import mineflayer from 'mineflayer'
import { WorldView, Viewer } from 'prismarine-viewer/viewer'
import pathfinder from 'mineflayer-pathfinder'
import { Vec3 } from 'vec3'

import blockInteraction from './blockInteraction'

import * as THREE from 'three'

import { initVR } from './vr'
import {
  activeModalStack,
  showModal,
  hideCurrentModal,
  activeModalStacks,
  replaceActiveModalStack,
  isGameActive,
  miscUiState,
  gameAdditionalState
} from './globalState'

import {
  pointerLock,
  goFullscreen, isCypress,
  loadScript,
  toMajorVersion,
  setLoadingScreenStatus,
  setRenderDistance
} from './utils'

import {
  removePanorama,
  addPanoramaCubeMap,
  initPanoramaOptions
} from './panorama'

import { startLocalServer, unsupportedLocalServerFeatures } from './createLocalServer'
import serverOptions from './defaultLocalServerOptions'
import updateTime from './updateTime'

import { subscribeKey } from 'valtio/utils'
import _ from 'lodash-es'

import { genTexturePackTextures, watchTexturepackInViewer } from './texturePack'
import { connectToPeer } from './localServerMultiplayer'
import CustomChannelClient from './customClient'
import debug from 'debug'

window.debug = debug
window.THREE = THREE

if ('serviceWorker' in navigator && !isCypress() && process.env.NODE_ENV !== 'development') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').then(registration => {
      console.log('SW registered:', registration)
    }).catch(registrationError => {
      console.log('SW registration failed:', registrationError)
    })
  })
}

// ACTUAL CODE

// Create three.js context, add to page
const renderer = new THREE.WebGLRenderer({
  powerPreference: options.highPerformanceGpu ? 'high-performance' : 'default',
})
initWithRenderer(renderer.domElement)
window.renderer = renderer
renderer.setPixelRatio(window.devicePixelRatio || 1) // todo this value is too high on ios, need to check, probably we should use avg, also need to make it configurable
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.domElement.id = 'viewer-canvas'
document.body.appendChild(renderer.domElement)

// Create viewer
const viewer: import('prismarine-viewer/viewer/lib/viewer').Viewer = new Viewer(renderer, options.numWorkers)
window.viewer = viewer
initPanoramaOptions(viewer)
watchTexturepackInViewer(viewer)

let renderInterval: number
watchValue(options, (o) => {
  renderInterval = o.frameLimit && 1000 / o.frameLimit
})

let postRenderFrameFn = () => { }
let delta = 0
let lastTime = performance.now()
const renderFrame = (time: DOMHighResTimeStamp) => {
  if (window.stopLoop) return
  window.requestAnimationFrame(renderFrame)
  if (window.stopRender) return
  if (renderInterval) {
    delta += time - lastTime
    lastTime = time
    if (delta > renderInterval) {
      delta %= renderInterval
      // continue rendering
    } else {
      return
    }
  }
  statsStart()
  viewer.update()
  renderer.render(viewer.scene, viewer.camera)
  postRenderFrameFn()
  statsEnd()
}
renderFrame(performance.now())

window.addEventListener('resize', () => {
  viewer.camera.aspect = window.innerWidth / window.innerHeight
  viewer.camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const loadingScreen = document.getElementById('loading-error-screen')

const hud = document.getElementById('hud')
const pauseMenu = document.getElementById('pause-screen')

let mouseMovePostHandle = (e) => { }
let lastMouseMove: number
let debugMenu
const updateCursor = () => {
  blockInteraction.update()
  debugMenu ??= hud.shadowRoot.querySelector('#debug-overlay')
  debugMenu.cursorBlock = blockInteraction.cursorBlock
}
function onCameraMove(e) {
  if (e.type !== 'touchmove' && !pointerLock.hasPointerLock) return
  e.stopPropagation?.()
  const now = performance.now()
  // todo: limit camera movement for now to avoid unexpected jumps
  if (now - lastMouseMove < 4) return
  lastMouseMove = now
  let { mouseSensX, mouseSensY } = options
  if (mouseSensY === true) mouseSensY = mouseSensX
  mouseMovePostHandle({
    x: e.movementX * mouseSensX * 0.0001,
    y: e.movementY * mouseSensY * 0.0001
  })
  // todo do it also on every block update within radius 5
  updateCursor()
}
window.addEventListener('mousemove', onCameraMove, { capture: true })


function hideCurrentScreens() {
  activeModalStacks['main-menu'] = activeModalStack
  replaceActiveModalStack('', [])
}

async function main() {
  const menu = document.getElementById('play-screen')
  menu.addEventListener('connect', e => {
    const options = e.detail
    connect(options)
  })
  const connectSingleplayer = (serverOverrides = {}) => {
    // todo clean
    connect({ server: '', port: '', proxy: '', singleplayer: true, username: options.localUsername, password: '', serverOverrides })
  }
  document.querySelector('#title-screen').addEventListener('singleplayer', (e) => {
    //@ts-expect-error
    connectSingleplayer(e.detail)
  })
  const qs = new URLSearchParams(window.location.search)
  if (qs.get('singleplayer') === '1') {
    // todo
    setTimeout(() => {
      connectSingleplayer()
    })
  }
}

let listeners = []
let timeouts = []
// only for dom listeners (no removeAllListeners)
// todo refactor them out of connect fn instead
const registerListener: import('./utilsTs').RegisterListener = (target, event, callback) => {
  target.addEventListener(event, callback)
  listeners.push({ target, event, callback })
}
const removeAllListeners = () => {
  for (const { target, event, callback } of listeners) {
    target.removeEventListener(event, callback)
  }
  listeners = []
}

// todo
// eslint-disable-next-line complexity
async function connect(connectOptions: {
  server: any; port?: string; singleplayer?: any; username: any; password: any; proxy: any; botVersion?: any; serverOverrides?; peerId?: string
}) {
  const menu = document.getElementById('play-screen')
  menu.style = 'display: none;'
  removePanorama()

  const singeplayer = connectOptions.singleplayer
  const p2pMultiplayer = !!connectOptions.peerId
  miscUiState.singleplayer = singeplayer
  miscUiState.flyingSquid = singeplayer || p2pMultiplayer
  const oldSetTimeout = window.setTimeout
  //@ts-expect-error
  window.setTimeout = (callback, ms) => {
    const id = oldSetTimeout.call(window, callback, ms)
    timeouts.push(id)
    return id
  }
  const { renderDistance, maxMultiplayerRenderDistance } = options
  const hostprompt = connectOptions.server
  const proxyprompt = connectOptions.proxy
  const { username } = connectOptions
  const { password } = connectOptions

  let host; let port; let proxy; let proxyport
  if (hostprompt.includes(':')) {
    [host, port] = hostprompt.split(':')
    port = parseInt(port, 10)
  } else {
    host = hostprompt
    port = 25_565
  }

  if (proxyprompt.includes(':')) {
    [proxy, proxyport] = proxyprompt.split(':')
    proxyport = parseInt(proxyport, 10)
  } else {
    proxy = proxyprompt
    proxyport = undefined
  }
  console.log(`connecting to ${host} ${port} with ${username}`)

  setLoadingScreenStatus('Logging in')

  let bot: mineflayer.Bot
  const destroyAll = () => {
    viewer.resetAll()
    window.localServer = undefined

    // simple variant, still buggy
    postRenderFrameFn = () => { }
    if (bot) {
      bot.removeAllListeners()
      bot._client.removeAllListeners()
      bot._client = undefined
      // for debugging
      window._botDisconnected = undefined
      window.bot = bot = undefined
    }
    removeAllListeners()
    for (const timeout of timeouts) {
      clearTimeout(timeout)
    }
    timeouts = []
  }
  const handleError = (err) => {
    console.log('Encountered error!', err)

    // #region rejoin key
    const controller = new AbortController()
    window.addEventListener('keydown', (e) => {
      if (e.code !== 'KeyR') return
      controller.abort()
      connect(connectOptions)
      loadingScreen.hasError = false
    }, { signal: controller.signal })
    // #endregion

    setLoadingScreenStatus(`Error encountered. Error message: ${err}`, true)
    destroyAll()
    if (isCypress()) throw err
  }

  const errorAbortController = new AbortController()
  window.addEventListener('unhandledrejection', (e) => {
    if (e.reason.name === 'ServerPluginLoadFailure') {
      if (confirm(`Failed to load server plugin ${e.reason.pluginName} (invoking ${e.reason.pluginMethod}). Continue?`)) {
        return
      }
    }
    handleError(e.reason)
  }, {
    signal: errorAbortController.signal
  })
  window.addEventListener('error', (e) => {
    handleError(e.message)
  }, {
    signal: errorAbortController.signal
  })

  if (proxy) {
    console.log(`using proxy ${proxy} ${proxyport}`)

    //@ts-expect-error
    net.setProxy({ hostname: proxy, port: proxyport })
  }

  let localServer
  try {
    Object.assign(serverOptions, _.defaultsDeep({}, connectOptions.serverOverrides ?? {}, options.localServerOptions, serverOptions))
    serverOptions['view-distance'] = renderDistance
    const downloadMcData = async (version) => {
      setLoadingScreenStatus(`Downloading data for ${version}`)
      try {
        await genTexturePackTextures(version)
      } catch (err) {
        console.error(err)
        const doContinue = prompt('Failed to apply texture pack. See errors in the console. Continue?')
        if (!doContinue) {
          setLoadingScreenStatus(undefined)
        }
      }
      await loadScript(`./mc-data/${toMajorVersion(version)}.js`)
    }

    const downloadVersion = connectOptions.botVersion || (singeplayer ? serverOptions.version : undefined)
    if (downloadVersion) {
      await downloadMcData(downloadVersion)
    }

    if (singeplayer) {
      // SINGLEPLAYER EXPLAINER:
      // Note 1: here we have custom sync communication between server Client (flying-squid) and game client (mineflayer)
      // Note 2: custom Server class is used which simplifies communication & Client creation on it's side
      // local server started
      // mineflayer.createBot (see source def)
      // bot._client = bot._client ?? mc.createClient(options) <-- mc-protocol package
      // tcpDns() skipped since we define connect option
      // in setProtocol: we emit 'connect' here below so in that file we send set_protocol and login_start (onLogin handler)
      // Client (class) of flying-squid (in server/login.js of mc-protocol): onLogin handler: skip most logic & go to loginClient() which assigns uuid and sends 'success' back to client (onLogin handler) and emits 'login' on the server (login.js in flying-squid handler)
      // flying-squid: 'login' -> player.login -> now sends 'login' event to the client (handled in many plugins in mineflayer) -> then 'update_health' is sent which emits 'spawn' in mineflayer

      setLoadingScreenStatus('Starting local server')
      localServer = window.localServer = startLocalServer()
      // todo need just to call quit if started
      // loadingScreen.maybeRecoverable = false
      // init world, todo: do it for any async plugins
      if (!localServer.pluginsReady) {
        await new Promise(resolve => {
          localServer.once('pluginsReady', resolve)
        })
      }
    }

    setLoadingScreenStatus('Creating mineflayer bot')
    bot = mineflayer.createBot({
      host,
      port,
      version: connectOptions.botVersion || false,
      ...p2pMultiplayer ? {
        stream: await connectToPeer(connectOptions.peerId),
      } : {},
      ...singeplayer || p2pMultiplayer ? {
        keepAlive: false,
      } : {},
      ...singeplayer ? {
        version: serverOptions.version,
        connect() { },
        Client: CustomChannelClient as any,
      } : {},
      username,
      password,
      viewDistance: 'tiny',
      checkTimeoutInterval: 240 * 1000,
      noPongTimeout: 240 * 1000,
      closeTimeout: 240 * 1000,
      async versionSelectedHook(client) {
        await downloadMcData(client.version)
        setLoadingScreenStatus('Connecting to server')
      }
    })
    window.bot = bot
    if (singeplayer || p2pMultiplayer) {
      // p2pMultiplayer still uses the same flying-squid server
      const _supportFeature = bot.supportFeature
      bot.supportFeature = (feature) => {
        if (unsupportedLocalServerFeatures.includes(feature)) {
          return false
        }
        return _supportFeature(feature)
      }

      bot.emit('inject_allowed')
      bot._client.emit('connect')
    } else {
      const setupConnectHandlers = () => {
        bot._client.socket.on('connect', () => {
          console.log('TCP connection established')
          //@ts-expect-error
          bot._client.socket._ws.addEventListener('close', () => {
            console.log('TCP connection closed')
            setTimeout(() => {
              if (bot) {
                bot.emit('end', 'TCP connection closed with unknown reason')
              }
            })
          })
        })
      }
      // socket setup actually can be delayed because of dns lookup
      if (bot._client.socket) {
        setupConnectHandlers()
      } else {
        const originalSetSocket = bot._client.setSocket.bind(bot._client)
        bot._client.setSocket = (socket) => {
          originalSetSocket(socket)
          setupConnectHandlers()
        }
      }

    }
  } catch (err) {
    handleError(err)
  }
  if (!bot) return

  const p2pConnectTimeout = p2pMultiplayer ? setTimeout(() => { throw new Error('Spawn timeout. There might be error on other side, check console.') }, 20_000) : undefined
  hud.preload(bot)

  // bot.on('inject_allowed', () => {
  //   loadingScreen.maybeRecoverable = false
  // })

  bot.on('error', handleError)

  bot.on('kicked', (kickReason) => {
    console.log('User was kicked!', kickReason)
    setLoadingScreenStatus(`The Minecraft server kicked you. Kick reason: ${kickReason}`, true)
    destroyAll()
  })

  bot.on('end', (endReason) => {
    console.log('disconnected for', endReason)
    destroyAll()
    setLoadingScreenStatus(`You have been disconnected from the server. End reason: ${endReason}`, true)
    if (isCypress()) throw new Error(`disconnected: ${endReason}`)
  })

  bot.once('login', () => {
    // server is ok, add it to the history
    const serverHistory: string[] = JSON.parse(localStorage.getItem('serverHistory') || '[]')
    serverHistory.unshift(connectOptions.server)
    localStorage.setItem('serverHistory', JSON.stringify([...new Set(serverHistory)]))

    setLoadingScreenStatus('Loading world')
  })

  bot.once('spawn', () => {
    if (p2pConnectTimeout) clearTimeout(p2pConnectTimeout)
    const mcData = require('minecraft-data')(bot.version)

    setLoadingScreenStatus('Placing blocks (starting viewer)')

    console.log('bot spawned - starting viewer')

    const { version } = bot

    const center = bot.entity.position

    const worldView: import('prismarine-viewer/viewer/lib/worldView').WorldView = new WorldView(bot.world, singeplayer ? renderDistance : Math.min(renderDistance, maxMultiplayerRenderDistance), center)
    window.worldView = worldView
    setRenderDistance()

    const updateFov = () => {
      let fovSetting = options.fov
      // todo check values and add transition
      if (bot.controlState.sprint && !bot.controlState.sneak) {
        fovSetting += 5
      }
      if (gameAdditionalState.isFlying) {
        fovSetting += 5
      }
      viewer.camera.fov = fovSetting
      viewer.camera.updateProjectionMatrix()
    }
    updateFov()
    subscribeKey(options, 'fov', updateFov)
    subscribeKey(gameAdditionalState, 'isFlying', updateFov)
    subscribeKey(gameAdditionalState, 'isSprinting', updateFov)
    subscribeKey(gameAdditionalState, 'isSneaking', () => {
      viewer.isSneaking = gameAdditionalState.isSneaking
      viewer.setFirstPersonCamera(bot.entity.position, bot.entity.yaw, bot.entity.pitch)
    })

    bot.on('physicsTick', () => updateCursor())
    viewer.setVersion(version)

    const debugMenu = hud.shadowRoot.querySelector('#debug-overlay')

    window.loadedData = mcData
    window.Vec3 = Vec3
    window.pathfinder = pathfinder
    window.debugMenu = debugMenu

    initVR(bot, renderer, viewer)

    postRenderFrameFn = () => {
      viewer.setFirstPersonCamera(null, bot.entity.yaw, bot.entity.pitch)
    }

    try {
      const gl = renderer.getContext()
      debugMenu.rendererDevice = gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL)
    } catch (err) {
      console.error(err)
      debugMenu.rendererDevice = '???'
    }

    // Link WorldView and Viewer
    viewer.listen(worldView)
    worldView.listenToBot(bot)
    worldView.init(bot.entity.position)

    updateTime(bot)

    // Bot position callback
    function botPosition() {
      // this might cause lag, but not sure
      viewer.setFirstPersonCamera(bot.entity.position, bot.entity.yaw, bot.entity.pitch)
      worldView.updatePosition(bot.entity.position)
    }
    bot.on('move', botPosition)
    botPosition()

    setLoadingScreenStatus('Setting callbacks')

    const maxPitch = 0.5 * Math.PI
    const minPitch = -0.5 * Math.PI
    mouseMovePostHandle = ({ x, y }) => {
      bot.entity.pitch -= y
      bot.entity.pitch = Math.max(minPitch, Math.min(maxPitch, bot.entity.pitch))
      bot.entity.yaw -= x
    }

    function changeCallback() {
      notification.show = false
      if (!pointerLock.hasPointerLock && activeModalStack.length === 0) {
        showModal(pauseMenu)
      }
    }

    registerListener(document, 'pointerlockchange', changeCallback, false)

    let holdingTouch: { touch: Touch, elem: HTMLElement } | undefined
    document.body.addEventListener('touchend', (e) => {
      if (!isGameActive(true)) return
      if (holdingTouch?.touch.identifier !== e.changedTouches[0].identifier) return
      holdingTouch.elem.click()
      holdingTouch = undefined
    })
    document.body.addEventListener('touchstart', (e) => {
      if (!isGameActive(true)) return
      e.preventDefault()
      holdingTouch = {
        touch: e.touches[0],
        elem: e.composedPath()[0] as HTMLElement
      }
    }, { passive: false })

    const cameraControlEl = hud

    /** after what time of holding the finger start breaking the block */
    const touchStartBreakingBlockMs = 500
    let virtualClickActive = false
    let virtualClickTimeout
    let screenTouches = 0
    let capturedPointer: { id; x; y; sourceX; sourceY; activateCameraMove; time } | null
    registerListener(document, 'pointerdown', (e) => {
      const clickedEl = e.composedPath()[0]
      if (!isGameActive(true) || !miscUiState.currentTouch || clickedEl !== cameraControlEl || e.pointerId === undefined) {
        return
      }
      screenTouches++
      if (screenTouches === 3) {
        window.dispatchEvent(new MouseEvent('mousedown', { button: 1 }))
      }
      if (capturedPointer) {
        return
      }
      cameraControlEl.setPointerCapture(e.pointerId)
      capturedPointer = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        sourceX: e.clientX,
        sourceY: e.clientY,
        activateCameraMove: false,
        time: Date.now()
      }
      virtualClickTimeout ??= setTimeout(() => {
        virtualClickActive = true
        document.dispatchEvent(new MouseEvent('mousedown', { button: 0 }))
      }, touchStartBreakingBlockMs)
    })
    registerListener(document, 'pointermove', (e) => {
      if (e.pointerId === undefined || e.pointerId !== capturedPointer?.id) return
      window.scrollTo(0, 0)
      e.preventDefault()
      e.stopPropagation()

      const allowedJitter = 1.1
      // todo support .pressure (3d touch)
      const xDiff = Math.abs(e.pageX - capturedPointer.sourceX) > allowedJitter
      const yDiff = Math.abs(e.pageY - capturedPointer.sourceY) > allowedJitter
      if (!capturedPointer.activateCameraMove && (xDiff || yDiff)) capturedPointer.activateCameraMove = true
      if (capturedPointer.activateCameraMove) {
        clearTimeout(virtualClickTimeout)
      }
      onCameraMove({ movementX: e.pageX - capturedPointer.x, movementY: e.pageY - capturedPointer.y, type: 'touchmove' })
      capturedPointer.x = e.pageX
      capturedPointer.y = e.pageY
    }, { passive: false })

    contro.on('stickMovement', ({ stick, vector }) => {
      if (stick !== 'right') return
      let { x, z } = vector
      if (Math.abs(x) < 0.18) x = 0
      if (Math.abs(z) < 0.18) z = 0
      onCameraMove({ movementX: x * 10, movementY: z * 10, type: 'touchmove' })
    })

    registerListener(document, 'lostpointercapture', (e) => {
      if (e.pointerId === undefined || e.pointerId !== capturedPointer?.id) return
      clearTimeout(virtualClickTimeout)
      virtualClickTimeout = undefined

      if (virtualClickActive) {
        // button 0 is left click
        document.dispatchEvent(new MouseEvent('mouseup', { button: 0 }))
        virtualClickActive = false
      } else if (!capturedPointer.activateCameraMove && (Date.now() - capturedPointer.time < touchStartBreakingBlockMs)) {
        document.dispatchEvent(new MouseEvent('mousedown', { button: 2 }))
        blockInteraction.update()
        document.dispatchEvent(new MouseEvent('mouseup', { button: 2 }))
      }
      capturedPointer = undefined
    }, { passive: false })

    registerListener(document, 'pointerup', (e) => {
      const clickedEl = e.composedPath()[0]
      if (!isGameActive(true) || !miscUiState.currentTouch || clickedEl !== cameraControlEl || e.pointerId === undefined) {
        return
      }
      screenTouches--
    })

    registerListener(document, 'contextmenu', (e) => e.preventDefault(), false)

    registerListener(document, 'blur', (e) => {
      bot.clearControlStates()
    }, false)

    setLoadingScreenStatus('Done!')
    console.log('Done!')

    hud.init(renderer, bot, host)
    hud.style.display = 'block'
    blockInteraction.init()

    setTimeout(() => {
      errorAbortController.abort()
      if (loadingScreen.hasError) return
      // remove loading screen, wait a second to make sure a frame has properly rendered
      setLoadingScreenStatus(undefined)
      hideCurrentScreens()
      void viewer.waitForChunksToRender().then(() => {
        console.log('All done and ready!')
        document.dispatchEvent(new Event('cypress-world-ready'))
      })
      miscUiState.gameLoaded = true
    }, singeplayer ? 0 : 2500)
  })
}

window.addEventListener('mousedown', (e) => {
  pointerLock.requestPointerLock()
})

window.addEventListener('keydown', (e) => {
  if (e.code !== 'Escape') return
  if (activeModalStack.length) {
    hideCurrentModal(undefined, () => {
      if (!activeModalStack.length) {
        pointerLock.justHitEscape = true
      }
    })
  } else if (pointerLock.hasPointerLock) {
    document.exitPointerLock()
    if (options.autoExitFullscreen) {
      document.exitFullscreen()
    }
  } else {
    document.dispatchEvent(new Event('pointerlockchange'))
  }
})

window.addEventListener('keydown', (e) => {
  if (e.code === 'F11') {
    e.preventDefault()
    goFullscreen(true)
  }
  if (e.code === 'KeyL' && e.altKey) {
    console.clear()
  }
})

addPanoramaCubeMap()
showModal(document.getElementById('title-screen'))
void main()
downloadAndOpenFile().then((downloadAction) => {
  if (downloadAction) return

  window.addEventListener('hud-ready', (e) => {
    // try to connect to peer
    const qs = new URLSearchParams(window.location.search)
    const peerId = qs.get('connectPeer')
    const version = qs.get('peerVersion')
    if (peerId) {
      let username = options.guestUsername
      if (options.askGuestName) username = prompt('Enter your username', username)
      if (!username) return
      options.guestUsername = username
      connect({
        server: '', port: '', proxy: '', password: '',
        username,
        botVersion: version || undefined,
        peerId
      })
    }
  })
  if (document.getElementById('hud').isReady) window.dispatchEvent(new Event('hud-ready'))
}, (err) => {
  console.error(err)
  alert(`Failed to download file: ${err}`)
})
