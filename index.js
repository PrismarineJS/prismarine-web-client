import GameConfiguration, { UserInformation, GameInformation, FolderInformation } from './lib/new/GameConfiguration.js'
import GameSettings from './lib/new/GameSettings'
import Context2D from './lib/new/renderer/Context2D'
import MainMenuScreen from './lib/new/gui/screen/MainMenuScreen.js'
import KeyboardListener from '/lib/new/KeyboardListener'
import { MCCanvas } from './lib/new/MCCanvas'
import MouseHelper from './lib/new/MouseHelper'
import IngameMenu from './lib/new/gui/screen/IngameMenu.js'
import TextureManager from './lib/new/renderer/TextureManager.js'
import { setAssetsDir } from './lib/new/utils/ResourceLocation.js'
import TextureBuffer from './lib/new/renderer/TextureBuffer.js'
import IngameGui from './lib/new/gui/IngameGui.js'
import Splashes from './lib/new/utils/Splashes.js'
import ResourceLoadingGui from './lib/new/gui/ResourceLoadingGui.js'
import Timer from './lib/new/utils/Timer.js'
import WorldLoading from './lib/new/gui/screen/WorldLoading.js'
import PlayerBot from './lib/new/PlayerBot.js'

/* global THREE */
require('./lib/menu')
require('./lib/chat')
require('./lib/playerlist')

const net = require('net')

// Workaround for process.versions.node not existing in the browser
process.versions.node = '14.0.0'

const mineflayer = require('mineflayer')
const { WorldView, Viewer } = require('prismarine-viewer/viewer')
const pathfinder = require('mineflayer-pathfinder')
const { Vec3 } = require('vec3')
global.THREE = require('three')

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('SW registered: ', registration)
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError)
    })
  })
}

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
function getPanoramaMesh () {
  const geometry = new THREE.SphereGeometry(500, 60, 40)
  geometry.scale(-1, 1, 1)
  const texture = new THREE.TextureLoader().load('title_blured.jpg')
  const material = new THREE.MeshBasicMaterial({ map: texture })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.y = Math.PI
  mesh.onBeforeRender = () => {
    mesh.rotation.y += 0.0005
    mesh.rotation.x = -Math.sin(mesh.rotation.y * 3) * 0.3
  }
  return mesh
}

export function removePanorama () {
  viewer.scene.remove(panoramaMesh)
  panoramaMesh = null
}

export function addPanorama() {
  panoramaMesh = getPanoramaMesh()
  viewer.scene.add(panoramaMesh);
}

export let panoramaMesh;
addPanorama();

// Browser animation loop
const animate = () => {
  window.requestAnimationFrame(animate)
  viewer.update()
  renderer.render(viewer.scene, viewer.camera)
}
animate()

window.addEventListener('resize', () => {
  viewer.camera.aspect = window.innerWidth / window.innerHeight
  viewer.camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

let mcInstance;

export default class Minecraft {
  constructor(gameConfig) {
    setMCInstance(this)
    this.mccanvas = new MCCanvas(this)
    this.timer = new Timer(20, 0);
    this.gameConfig = gameConfig
    setAssetsDir(gameConfig.folderInfo.assetsDir)
    this.gameSettings = new GameSettings(this)
    this.updateWindowSize();
    this.mouseHelper = new MouseHelper(this)
    this.mouseHelper.registerCallbacks()
    this.keyboardListener = new KeyboardListener(this)
    this.keyboardListener.setupCallbacks()
    this.splashes = new Splashes(this.gameConfig.userInfo.username)
    this.textureManager = new TextureManager(this)
    this.textureBuffer = new TextureBuffer()
    this.running = true
    this.isInsideWorld = false
    this.loadingGui = null
    this.isReloading = false
    this.ingameGUI = new IngameGui(this)
    this.currentScreen = null;

    this.displayGuiScreen(new MainMenuScreen(true));

    this.playerBot = null;
    this.world = null;
    this.reloadResources();
  }

  async reloadResources () {
    this.loadingGui = new ResourceLoadingGui(this);
    this.isReloading = true;
    await this.textureManager.reload();
    await this.splashes.reload();

    this.isReloading = false;
    this.loadingGui = null;
    return this.currentScreen.initScreen(this, this.mccanvas.scaledWidth, this.mccanvas.scaledHeight)
  }

  updateWindowSize() {
    const i = this.mccanvas.calcGuiScale(this.gameSettings.guiScale)
    this.mccanvas.setGuiScale(i)
    if(this.currentScreen != null) this.currentScreen.resize(this, this.mccanvas.scaledWidth, this.mccanvas.scaledHeight);
    this.mccanvas.canvas.width = window.innerWidth
    this.mccanvas.canvas.height = window.innerHeight

    Context2D.setup(this.mccanvas.guiScaleFactor, true)
    console.log(this.mccanvas.canvas.width, this.mccanvas.canvas.height, 'MCGUI resized')
  }

  run() {
    try {
      let loopFunc;

      const loop = () => {
        loopFunc = requestAnimationFrame(loop)

        if(this.running) this.runGameLoop()
        else cancelAnimationFrame(loopFunc)
      }

      loop()
    } catch (e) {
      console.log(`Failed and stopped frame loop: ${e}`)
    }
  }

  runGameLoop() {
    if(this.isInsideWorld) {
      let j = this.timer.getPartialTicks(new Date().getMilliseconds());
      for(let k = 0; k < Math.min(10, j); ++k) this.runTick();
    }
    
    this.render();
  }

  runTick() {
    this.ingameGUI.tick();
  }

  render() {
    const i = (this.mouseHelper.mouseX / this.mccanvas.guiScaleFactor);
    const j = (this.mouseHelper.mouseY / this.mccanvas.guiScaleFactor);

    Context2D.clear();

    if(this.isInsideWorld) {
      if(!this.gameSettings.hideGUI || this.currentScreen != null) this.ingameGUI.renderIngameGui();
    }

    if(this.loadingGui != null) this.loadingGui.render(i, j);
    else if(this.currentScreen != null) this.currentScreen.render(i, j);
  }

  displayGuiScreen (guiScreen) {
    if(this.currentScreen != null) this.currentScreen.onClose()

    if(guiScreen == null && !this.isInsideWorld) guiScreen = new MainMenuScreen()

    if(guiScreen instanceof MainMenuScreen) this.gameSettings.showDebugInfo = false;

    this.currentScreen = guiScreen

    if(guiScreen != null) guiScreen.initScreen(this, this.mccanvas.scaledWidth, this.mccanvas.scaledHeight)
  }

  async main () {
    this.currentScreen = null;
    const menu = document.getElementById('prismarine-menu')
    // menu.addEventListener('connect', this.handleConnect);

   /*  const handleConnect = (e) => {
      const menu = document.getElementById('prismarine-menu')
      const options = e.detail
      menu.style = 'display: none;'
      getMCInstance().displayGuiScreen(new WorldLoading());
      
      getMCInstance().connect(options)
    } */
    
    menu.addEventListener('connect', (e) => {
      const menu = document.getElementById('prismarine-menu')
      const options = e.detail
      menu.style = 'display: none;'
      this.displayGuiScreen(new WorldLoading());
      removePanorama();
      this.connect(options)
    });
  }

  async connect (options) {
    const chat = document.getElementById('chatbox')
    const playerList = document.getElementById('playerlist')

    const viewDistance = this.gameSettings.renderDistanceChunks
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
      net.setProxy({ hostname: proxy, port: proxyport })
    }

    this.currentScreen.setStatus('Logging in');

    const bot = mineflayer.createBot({
      host,
      port,
      username,
      password,
      viewDistance: 'tiny',
      checkTimeoutInterval: 240 * 1000,
      noPongTimeout: 240 * 1000,
      closeTimeout: 240 * 1000
    })

    this.world = {};
    this.playerBot = new PlayerBot(this, bot);

    bot.once('spawn', () => {
      const mcData = require('minecraft-data')(bot.version)

      this.currentScreen.setStatus('Placing blocks (starting viewer)...');

      console.log('bot spawned - starting viewer')

      const version = bot.version

      const center = bot.entity.position

      const worldView = new WorldView(bot.world, viewDistance, center)

      chat.init(bot._client, renderer)
      playerList.init(bot)

      viewer.setVersion(version)

      window.worldView = worldView
      window.bot = bot
      window.mcData = mcData
      window.viewer = viewer
      window.Vec3 = Vec3
      window.pathfinder = pathfinder
      window.renderer = renderer
      window.settings = {
        mouseSensXValue: window.localStorage.getItem('mouseSensX') ?? 0.005,
        mouseSensYValue: window.localStorage.getItem('mouseSensY') ?? 0.005,
        set mouseSensX (v) { this.mouseSensXValue = v; window.localStorage.setItem('mouseSensX', v) },
        set mouseSensY (v) { this.mouseSensYValue = v; window.localStorage.setItem('mouseSensY', v) },
        get mouseSensX () { return this.mouseSensXValue },
        get mouseSensY () { return this.mouseSensYValue }
      }

      // Link WorldView and Viewer
      viewer.listen(worldView)
      worldView.listenToBot(bot)
      worldView.init(bot.entity.position)

      // Create cursor mesh
      const boxGeometry = new THREE.BoxBufferGeometry(1.001, 1.001, 1.001)
      const cursorMesh = new THREE.LineSegments(new THREE.EdgesGeometry(boxGeometry), new THREE.LineBasicMaterial({ color: 0 }))
      viewer.scene.add(cursorMesh)

      const updateCursor = () => {
        const cursorBlock = bot.blockAtCursor()
        if (!cursorBlock || !bot.canDigBlock(cursorBlock)) {
          cursorMesh.visible = false
          return
        } else {
          cursorMesh.visible = true
        }
        cursorMesh.position.set(cursorBlock.position.x + 0.5, cursorBlock.position.y + 0.5, cursorBlock.position.z + 0.5)
      }
 
      bot.on('move', () => {
        /* this.playerBot.updateBotPosition(viewer, worldView);
        this.playerBot.updateCursor(cursorMesh); */
      });

      viewer.camera.position.set(center.x, center.y, center.z)

      this.currentScreen.setStatus('Setting callbacks...');

      function moveCallback (e) {
        bot.entity.pitch -= e.movementY * window.settings.mouseSensYValue
        bot.entity.pitch = Math.max(minPitch, Math.min(maxPitch, bot.entity.pitch))
        bot.entity.yaw -= e.movementX * window.settings.mouseSensXValue

        viewer.setFirstPersonCamera(null, bot.entity.yaw, bot.entity.pitch)
        updateCursor()
      }

      const changeCallback = () => {
        if (document.pointerLockElement === renderer.domElement ||
          document.mozPointerLockElement === renderer.domElement ||
          document.webkitPointerLockElement === renderer.domElement) {
          document.addEventListener('mousemove', moveCallback, false)
        } else {
          document.removeEventListener('mousemove', moveCallback, false)
          this.displayGuiScreen(new IngameMenu())
        }
      }

      document.addEventListener('pointerlockchange', changeCallback, false)
      document.addEventListener('mozpointerlockchange', changeCallback, false)
      document.addEventListener('webkitpointerlockchange', changeCallback, false)

      renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock ||
        renderer.domElement.mozRequestPointerLock ||
        renderer.domElement.webkitRequestPointerLock

      let i = true

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
        window.scrollTo(0, 0)
        e.preventDefault()
        e.stopPropagation()
        lastTouch = undefined
      }, { passive: false })

      renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock ||
        renderer.domElement.mozRequestPointerLock ||
        renderer.domElement.webkitRequestPointerLock

      document.addEventListener('mousedown', (e) => {
        if (i || (!(document.pointerLockElement === renderer.domElement ||
          document.mozPointerLockElement === renderer.domElement ||
          document.webkitPointerLockElement === renderer.domElement) && this.currentScreen === null)) {
          renderer.domElement.requestPointerLock()
          i = false
        }
      })

      const codes = {
        KeyW: 'forward',
        KeyS: 'back',
        KeyA: 'right',
        KeyD: 'left',
        Space: 'jump',
        ShiftLeft: 'sneak',
        ControlLeft: 'sprint'
      }

      document.addEventListener('keydown', (e) => {
        if (chat.inChat) return
        console.log(e.code)
        if (e.code in codes) {
          bot.setControlState(codes[e.code], true)
        }
        if (e.code === 'KeyQ') {
          if (bot.heldItem) bot.tossStack(bot.heldItem)
        }
      }, false)

      document.addEventListener('keyup', (e) => {
        if (e.code in codes) {
          bot.setControlState(codes[e.code], false)
        }
      }, false)

      document.addEventListener('mousedown', (e) => {
        if (document.pointerLockElement !== renderer.domElement) return

        const cursorBlock = bot.blockAtCursor()
        if (!cursorBlock) return

        if (e.button === 0) {
          if (bot.canDigBlock(cursorBlock)) {
            bot.dig(cursorBlock, 'ignore', (e) => {
              console.log(e);
            })
          }
        } else if (e.button === 2) {
          const vecArray = [new Vec3(0, -1, 0), new Vec3(0, 1, 0), new Vec3(0, 0, -1), new Vec3(0, 0, 1), new Vec3(-1, 0, 0), new Vec3(1, 0, 0)]
          const vec = vecArray[cursorBlock.face]

          const delta = cursorBlock.intersect.minus(cursorBlock.position)
          bot._placeBlockWithOptions(cursorBlock, vec, { delta, forceLook: 'ignore' })
        }
      }, false)

      document.addEventListener('mouseup', (e) => {
        bot.stopDigging()
      }, false)

      this.currentScreen.setStatus('Done!');
      console.log('Done!') // only do that because it's read in index.html and npm run fix complains.

      this.isInsideWorld = true

      bot.on('health', () => {
        this.playerBot.updateAttributes();
      })
    })
  }
}

export function setMCInstance(instance) {
  mcInstance = instance
}

export function getMCInstance() {
  return mcInstance
}

class Main {
  static main () {
    const gameConfig = new GameConfiguration(new UserInformation('Steve'), new FolderInformation('https://webclient.prismarine.js.org/'))

    let mc;
    try {
      mc = new Minecraft(gameConfig);
    } catch (e) {
      console.log('Failed to initialize MC GUI: ' + e)
    }

    try {
      mc.run()
    } catch (e) {
      console.log('Failed to run MC GUI: ' + e)
    }
  }
}

Main.main()

export {
  renderer,
  viewer
}