//@ts-check
/* global THREE */
require('./lib/chat')

require('./lib/menus/components/button')
require('./lib/menus/components/edit_box')
require('./lib/menus/components/slider')
require('./lib/menus/components/hotbar')
require('./lib/menus/components/health_bar')
require('./lib/menus/components/food_bar')
require('./lib/menus/components/breath_bar')
require('./lib/menus/components/debug_overlay')
require('./lib/menus/components/playerlist_overlay')
require('./lib/menus/components/bossbars_overlay')
require('./lib/menus/hud')
require('./lib/menus/play_screen')
require('./lib/menus/pause_screen')
require('./lib/menus/loading_screen')
require('./lib/menus/keybinds_screen')
require('./lib/menus/options_screen')
require('./lib/menus/advanced_options_screen')
require('./lib/menus/notification')
require('./lib/menus/title_screen')

const net = require('net')
const Stats = require('stats.js')

// workaround for mineflayer
process.versions.node = '14.0.0'

const mineflayer = require('mineflayer')
const { WorldView, Viewer, MapControls } = require('prismarine-viewer/viewer')
const PrismarineWorld = require('prismarine-world')
const nbt = require('prismarine-nbt')
const pathfinder = require('mineflayer-pathfinder')
const { Vec3 } = require('vec3')

const Cursor = require('./lib/cursor')
//@ts-ignore
global.THREE = require('three')
const { initVR } = require('./lib/vr')
const { activeModalStack, showModal, hideModal, hideCurrentModal } = require('./lib/globalState')
const { pointerLock, goFullscreen, toNumber } = require('./lib/utils')
const { notification } = require('./lib/menus/notification')

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('SW registered: ', registration)
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError)
    })
  })
}

// ACTUAL CODE

const stats = new Stats()
const stats2 = new Stats()
stats2.showPanel(2)

document.body.appendChild(stats.dom)
stats2.dom.style.left = '80px'
document.body.appendChild(stats2.dom)
// const debugPitch = document.createElement('span')
// debugPitch.style.cssText = `
//   position: absolute;
//   top: 0;
//   right: 0;
//   z-index: 100;
//   color:white;
// `
// document.body.appendChild(debugPitch)

const maxPitch = 0.5 * Math.PI
const minPitch = -0.5 * Math.PI

// Create three.js context, add to page
const renderer = new THREE.WebGLRenderer()
renderer.setPixelRatio(window.devicePixelRatio || 1)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Create viewer
const viewer = new Viewer(renderer)

// Menu panorama background
function addPanoramaCubeMap () {
  let time = 0
  viewer.camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.05, 1000)
  viewer.camera.updateProjectionMatrix()
  viewer.camera.position.set(0, 0, 0)
  viewer.camera.rotation.set(0, 0, 0)
  const panorGeo = new THREE.BoxGeometry(1000, 1000, 1000)

  const loader = new THREE.TextureLoader()
  const panorMaterials = [
    new THREE.MeshBasicMaterial({ map: loader.load('extra-textures/background/panorama_1.png'), transparent: true, side: THREE.DoubleSide }), // WS
    new THREE.MeshBasicMaterial({ map: loader.load('extra-textures/background/panorama_3.png'), transparent: true, side: THREE.DoubleSide }), // ES
    new THREE.MeshBasicMaterial({ map: loader.load('extra-textures/background/panorama_4.png'), transparent: true, side: THREE.DoubleSide }), // Up
    new THREE.MeshBasicMaterial({ map: loader.load('extra-textures/background/panorama_5.png'), transparent: true, side: THREE.DoubleSide }), // Down
    new THREE.MeshBasicMaterial({ map: loader.load('extra-textures/background/panorama_0.png'), transparent: true, side: THREE.DoubleSide }), // NS
    new THREE.MeshBasicMaterial({ map: loader.load('extra-textures/background/panorama_2.png'), transparent: true, side: THREE.DoubleSide }) // SS
  ]

  const panoramaBox = new THREE.Mesh(panorGeo, panorMaterials)

  panoramaBox.onBeforeRender = () => {
    time += 0.01
    panoramaBox.rotation.y = Math.PI + time * 0.01
    panoramaBox.rotation.z = Math.sin(-time * 0.001) * 0.001
  }

  const group = new THREE.Object3D()
  group.add(panoramaBox)

  const Entity = require('prismarine-viewer/viewer/lib/entity/Entity')
  for (let i = 0; i < 42; i++) {
    const m = new Entity('1.16.4', 'squid').mesh
    m.position.set(Math.random() * 30 - 15, Math.random() * 20 - 10, Math.random() * 10 - 17)
    m.rotation.set(0, Math.PI + Math.random(), -Math.PI / 4, 'ZYX')
    const v = Math.random() * 0.01
    m.children[0].onBeforeRender = () => {
      m.rotation.y += v
      m.rotation.z = Math.cos(panoramaBox.rotation.y * 3) * Math.PI / 4 - Math.PI / 2
    }
    group.add(m)
  }

  viewer.scene.add(group)
  return group
}

const panoramaCubeMap = addPanoramaCubeMap()

function removePanorama () {
  viewer.camera = new THREE.PerspectiveCamera(document.getElementById('options-screen').fov, window.innerWidth / window.innerHeight, 0.1, 1000)
  viewer.camera.updateProjectionMatrix()
  viewer.scene.remove(panoramaCubeMap)
}

const frameLimit = toNumber(localStorage.frameLimit)
let interval = frameLimit && 1000 / frameLimit
window.addEventListener('option-change', (/** @type {any} */{ detail }) => {
  if (detail.name === 'frameLimit') interval = toNumber(detail.value) && 1000 / toNumber(detail.value)
})

let postRenderFrameFn = () => { }
let delta = 0
let lastTime = performance.now()
const renderFrame = (/** @type {DOMHighResTimeStamp} */ time) => {
  if (window.stopLoop) return
  window.requestAnimationFrame(renderFrame)
  if (window.stopRender) return
  if (interval) {
    delta += time - lastTime
    lastTime = time
    if (delta > interval) {
      delta = delta % interval
      // continue rendering
    } else {
      return
    }
  }
  stats.begin()
  stats2.begin()
  viewer.update()
  renderer.render(viewer.scene, viewer.camera)
  postRenderFrameFn()
  stats.end()
  stats2.end()
}
renderFrame(performance.now())

window.addEventListener('resize', () => {
  viewer.camera.aspect = window.innerWidth / window.innerHeight
  viewer.camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const loadingScreen = document.getElementById('loading-screen')

const hud = document.getElementById('hud')
const optionsScrn = document.getElementById('options-screen')
const keyBindScrn = document.getElementById('keybinds-screen')
const pauseMenu = document.getElementById('pause-screen')

function setLoadingScreenStatus (status, isError = false) {
  showModal(loadingScreen)
  if (loadingScreen.hasError) return
  loadingScreen.status = status
  loadingScreen.hasError = isError
}

async function main () {
  const menu = document.getElementById('play-screen')

  menu.addEventListener('connect', e => {
    const options = e.detail
    menu.style = 'display: none;'
    removePanorama()
    connect(options)
  })
}

async function connect (options) {
  const debugMenu = hud.shadowRoot.querySelector('#debug-overlay')

  const viewDistance = optionsScrn.renderDistance
  const hostprompt = options.server
  const proxyprompt = options.proxy
  const username = options.username
  const password = options.password

  let host, port, proxy, proxyport
  if (!hostprompt.includes(':')) {
    host = hostprompt
    port = 25565
  } else {
    [host, port] = hostprompt.split(':')
    port = parseInt(port, 10)
  }

  if (!proxyprompt.includes(':')) {
    proxy = proxyprompt
    proxyport = undefined
  } else {
    [proxy, proxyport] = proxyprompt.split(':')
    proxyport = parseInt(proxyport, 10)
  }
  console.log(`connecting to ${host} ${port} with ${username}`)

  if (proxy) {
    console.log(`using proxy ${proxy} ${proxyport}`)
    //@ts-ignore
    net.setProxy({ hostname: proxy, port: proxyport })
  }

  setLoadingScreenStatus('Logging in')

  const bot = mineflayer.createBot({
    host,
    port,
    version: options.botVersion === '' ? false : options.botVersion,
    username,
    password,
    viewDistance: 'tiny',
    checkTimeoutInterval: 240 * 1000,
    noPongTimeout: 240 * 1000,
    closeTimeout: 240 * 1000
  })
  hud.preload(bot)

  bot.on('error', (err) => {
    console.log('Encountered error!', err)
    const controller = new AbortController()
    window.addEventListener('keydown', (e) => {
      if (e.code !== 'KeyR') return
      controller.abort()
      connect(options)
      loadingScreen.hasError = false
    }, { signal: controller.signal })
    setLoadingScreenStatus(`Error encountered. Error message: ${err}. Please reload the page`, true)
  })

  bot.on('kicked', (kickReason) => {
    console.log('User was kicked!', kickReason)
    setLoadingScreenStatus(`The Minecraft server kicked you. Kick reason: ${kickReason}. Please reload the page to rejoin`, true)
  })

  bot.on('end', (endReason) => {
    console.log('disconnected for', endReason)
    setLoadingScreenStatus(`You have been disconnected from the server. End reason: ${endReason}. Please reload the page to rejoin`, true)
  })

  bot.once('login', () => {
    // server is ok, add it to the history
    /** @type {string[]} */
    const serverHistory = JSON.parse(localStorage.getItem('serverHistory') || '[]')
    serverHistory.unshift(options.server)
    localStorage.setItem('serverHistory', JSON.stringify([...new Set(serverHistory)]))

    setLoadingScreenStatus('Loading world')
  })

  bot.once('spawn', () => {
    const mcData = require('minecraft-data')(bot.version)

    setLoadingScreenStatus('Placing blocks (starting viewer)')

    console.log('bot spawned - starting viewer')

    const version = bot.version

    const center = bot.entity.position

    const worldView = new WorldView(bot.world, viewDistance, center)

    optionsScrn.isInsideWorld = true
    optionsScrn.addEventListener('fov_changed', (e) => {
      viewer.camera.fov = e.detail.fov
      viewer.camera.updateProjectionMatrix()
    })

    viewer.setVersion(version)

    window.worldView = worldView
    window.bot = bot
    window.mcData = mcData
    window.viewer = viewer
    window.Vec3 = Vec3
    window.pathfinder = pathfinder
    window.debugMenu = debugMenu
    window.settings = optionsScrn
    window.renderer = renderer

    initVR(bot, renderer, viewer)

    const cursor = new Cursor(viewer, renderer, bot)
    postRenderFrameFn = () => {
      debugMenu.cursorBlock = cursor.cursorBlock
      viewer.setFirstPersonCamera(null, bot.entity.yaw, bot.entity.pitch)
      cursor.update(bot)
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

    // Bot position callback
    function botPosition () {
      // this might cause lag, but not sure
      viewer.setFirstPersonCamera(bot.entity.position, bot.entity.yaw, bot.entity.pitch)
      worldView.updatePosition(bot.entity.position)
    }
    bot.on('move', botPosition)
    botPosition()

    setLoadingScreenStatus('Setting callbacks')

    let yaw
    let moveCallsPerSec = 0
    setInterval(() => {
      console.log('mouse frequency', moveCallsPerSec)
      moveCallsPerSec = 0
    }, 1000)
    let lastCall
    function moveCallback (e) {
      if (!pointerLock.hasPointerLock) return
      e.stopPropagation?.()
      const now = performance.now()
      if (now - lastCall < 5) return
      lastCall = now
      moveCallsPerSec++
      let { mouseSensX, mouseSensY } = optionsScrn
      if (mouseSensY === true) mouseSensY = mouseSensX
      yaw ??= bot.entity.yaw
      bot.entity.pitch -= e.movementY * mouseSensX * 0.0001
      bot.entity.pitch = Math.max(minPitch, Math.min(maxPitch, bot.entity.pitch))
      const diff = e.movementX * mouseSensY * 0.0001
      bot.entity.yaw -= diff
      yaw -= diff
      // debugPitch.innerText = +debugPitch.innerText + e.movementX
    }

    function changeCallback () {
      notification.show = false
      if (!pointerLock.hasPointerLock && activeModalStack.length === 0) {
        showModal(pauseMenu)
      }
    }

    window.addEventListener('mousemove', moveCallback, { capture: true })
    document.addEventListener('pointerlockchange', changeCallback, false)

    let lastTouch
    document.addEventListener('touchmove', (e) => {
      window.scrollTo(0, 0)
      e.preventDefault()
      e.stopPropagation()
      if (lastTouch !== undefined) {
        moveCallback({ movementX: e.touches[0].pageX - lastTouch.pageX, movementY: e.touches[0].pageY - lastTouch.pageY })
      }
      lastTouch = e.touches[0]
    }, { passive: false })

    document.addEventListener('touchend', (e) => {
      lastTouch = undefined
    }, { passive: false })

    document.addEventListener('contextmenu', (e) => e.preventDefault(), false)

    window.addEventListener('blur', (e) => {
      bot.clearControlStates()
    }, false)

    document.addEventListener('keydown', (e) => {
      if (activeModalStack.length) return

      keyBindScrn.keymaps.forEach(km => {
        if (e.code === km.key) {
          switch (km.defaultKey) {
            case 'KeyQ':
              if (bot.heldItem) bot.tossStack(bot.heldItem)
              break
            case 'ControlLeft':
              bot.setControlState('sprint', true)
              break
            case 'ShiftLeft':
              bot.setControlState('sneak', true)
              break
            case 'Space':
              bot.setControlState('jump', true)
              break
            case 'KeyD':
              bot.setControlState('right', true)
              break
            case 'KeyA':
              bot.setControlState('left', true)
              break
            case 'KeyS':
              bot.setControlState('back', true)
              break
            case 'KeyW':
              bot.setControlState('forward', true)
              break
          }
        }
      })
    }, false)

    document.addEventListener('keyup', (e) => {
      keyBindScrn.keymaps.forEach(km => {
        if (e.code === km.key) {
          switch (km.defaultKey) {
            case 'ControlLeft':
              bot.setControlState('sprint', false)
              break
            case 'ShiftLeft':
              bot.setControlState('sneak', false)
              break
            case 'Space':
              bot.setControlState('jump', false)
              break
            case 'KeyD':
              bot.setControlState('right', false)
              break
            case 'KeyA':
              bot.setControlState('left', false)
              break
            case 'KeyS':
              bot.setControlState('back', false)
              break
            case 'KeyW':
              bot.setControlState('forward', false)
              break
          }
        }
      })
    }, false)

    setLoadingScreenStatus('Done!')
    console.log('Done!')

    hud.init(renderer, bot, host)
    hud.style.display = 'block'

    setTimeout(function () {
      if (loadingScreen.hasError) return
      // remove loading screen, wait a second to make sure a frame has properly rendered
      loadingScreen.style.display = 'none'
      activeModalStack.splice(0, activeModalStack.length)
    }, 2500)
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
  } else {
    if (pointerLock.hasPointerLock) {
      document.exitPointerLock()
    } else {
      document.dispatchEvent(new Event('pointerlockchange'))
    }
  }
})

window.addEventListener('keydown', (e) => {
  if (e.code === 'F11') {
    e.preventDefault()
    goFullscreen(true)
  }
  if (e.code === 'KeyL') {
    console.clear()
  }
  // if (e.code === 'KeyD') {
  //   debugPitch.innerText = '0'
  // }
})

showModal(document.getElementById('title-screen'))
main()
