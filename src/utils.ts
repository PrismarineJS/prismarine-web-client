import { activeModalStack, hideModal, miscUiState, showModal } from './globalState'
import { notification } from './menus/notification'
import * as crypto from 'crypto'
import UUID from 'uuid-1345'
import { options } from './optionsStorage'
import { saveWorld } from './builtinCommands'
import { openWorldZip } from './browserfs'
import { installTexturePack } from './texturePack'

export const goFullscreen = async (doToggle = false) => {
  if (!document.fullscreenElement) {
    // todo display a message or repeat?
    await document.documentElement.requestFullscreen().catch(() => { })
    // request full keyboard access
    //@ts-ignore
    navigator.keyboard?.lock?.(['Escape', 'KeyW'])
  } else if (doToggle) {
    await document.exitFullscreen().catch(() => { })
  }
}

export const toNumber = (val) => {
  const num = Number(val)
  return isNaN(num) ? undefined : num
}

export const pointerLock = {
  get hasPointerLock() {
    return document.pointerLockElement
  },
  justHitEscape: false,
  async requestPointerLock() {
    if (document.getElementById('hud').style.display === 'none' || activeModalStack.length || !document.documentElement.requestPointerLock || miscUiState.currentTouch) {
      return
    }
    if (options.autoFullScreen) {
      void goFullscreen()
    }
    const displayBrowserProblem = () => {
      notification.show = true
      // todo use notification stack
      notification.autoHide = true
      notification.message = navigator['keyboard'] ? 'Browser Limitation: Click on screen, enable Auto Fullscreen or F11' : 'Browser Limitation: Click on screen or use fullscreen in Chrome'
    }
    if (!(document.fullscreenElement && navigator['keyboard']) && this.justHitEscape) {
      displayBrowserProblem()
    } else {
      //@ts-ignore
      const promise: any = document.documentElement.requestPointerLock({
        unadjustedMovement: options.mouseRawInput
      })
      promise?.catch((error) => {
        if (error.name === "NotSupportedError") {
          // Some platforms may not support unadjusted movement, request again a regular pointer lock.
          document.documentElement.requestPointerLock()
        } else if (error.name === 'SecurityError') {
          // cause: https://discourse.threejs.org/t/how-to-avoid-pointerlockcontrols-error/33017/4
          displayBrowserProblem()
        } else {
          console.error(error)
        }
      })
    }
    this.justHitEscape = false
  }
}

window.getScreenRefreshRate = getScreenRefreshRate

/**
 * Allows to obtain the estimated Hz of the primary monitor in the system.
 */
export function getScreenRefreshRate() {
  let requestId = null
  let callbackTriggered = false
  let resolve

  const DOMHighResTimeStampCollection = []

  const triggerAnimation = (DOMHighResTimeStamp) => {
    DOMHighResTimeStampCollection.unshift(DOMHighResTimeStamp)

    if (DOMHighResTimeStampCollection.length > 10) {
      let t0 = DOMHighResTimeStampCollection.pop()
      let fps = Math.floor(1000 * 10 / (DOMHighResTimeStamp - t0))

      if (!callbackTriggered) {
        resolve(fps/* , DOMHighResTimeStampCollection */)
      }

      callbackTriggered = true
    }

    requestId = window.requestAnimationFrame(triggerAnimation)
  }

  window.requestAnimationFrame(triggerAnimation)

  window.setTimeout(() => {
    window.cancelAnimationFrame(requestId)
    requestId = null
  }, 500)

  return new Promise(_resolve => {
    resolve = _resolve
  })
}

export const getGamemodeNumber = (bot) => {
  switch (bot.game.gameMode) {
    case 'survival': return 0
    case 'creative': return 1
    case 'adventure': return 2
    case 'spectator': return 3
    default: return -1
  }
}

export const isCypress = () => {
  return localStorage.cypress === 'true'
}

// https://github.com/PrismarineJS/node-minecraft-protocol/blob/cf1f67117d586b5e6e21f0d9602da12e9fcf46b6/src/server/login.js#L170
function javaUUID(s: string) {
  const hash = crypto.createHash('md5')
  hash.update(s, 'utf8')
  const buffer = hash.digest()
  buffer[6] = (buffer[6] & 0x0f) | 0x30
  buffer[8] = (buffer[8] & 0x3f) | 0x80
  return buffer
}

export function nameToMcOfflineUUID(name) {
  return (new UUID(javaUUID('OfflinePlayer:' + name))).toString()
}

export const setLoadingScreenStatus = function (status: string | undefined, isError = false, hideDots = false) {
  const loadingScreen = document.getElementById('loading-error-screen')

  if (status === undefined) {
    loadingScreen.status = ''
    hideModal({ elem: loadingScreen, }, null, { force: true })
    return
  }

  // todo update in component instead
  showModal(loadingScreen)
  if (loadingScreen.hasError) {
    miscUiState.gameLoaded = false
    return
  }
  loadingScreen.hideDots = hideDots
  loadingScreen.hasError = isError
  loadingScreen.lastStatus = isError ? loadingScreen.status : ''
  loadingScreen.status = status
}


export const disconnect = async () => {
  if (window.localServer) {
    await saveWorld()
    localServer.quit()
  } else {
    // workaround bot.end doesn't end the socket and emit end event
    bot.end()
    bot._client.socket.end()
  }
  bot._client.emit('end', 'You left the server')
  miscUiState.gameLoaded = false
}

export const loadScript = async function (scriptSrc: string) {
  if (document.querySelector(`script[src="${scriptSrc}"]`)) {
    return
  }

  return new Promise((resolve, reject) => {
    const scriptElement = document.createElement('script')
    scriptElement.src = scriptSrc
    scriptElement.async = true

    scriptElement.onload = () => {
      resolve(scriptElement)
    }

    scriptElement.onerror = (error) => {
      reject(error)
    }

    document.head.appendChild(scriptElement)
  })
}

// doesn't support snapshots
export const toMajorVersion = (version) => {
  const [a, b] = (version + '').split('.')
  return `${a}.${b}`
}

let prevRenderDistance = options.renderDistance
export const reloadChunks = () => {
  if (!worldView || !localServer) return
  localServer.options['view-distance'] = options.renderDistance
  worldView.viewDistance = options.renderDistance
  localServer.players[0].emit('playerChangeRenderDistance', options.renderDistance)
  worldView.updatePosition(bot.entity.position, true)
  prevRenderDistance = options.renderDistance
}

export const openFilePicker = (specificCase?: 'resourcepack') => {
  // create and show input picker
  let picker: HTMLInputElement = document.body.querySelector('input#file-zip-picker')
  if (!picker) {
    picker = document.createElement('input')
    picker.type = 'file'
    picker.accept = '.zip'

    picker.addEventListener('change', () => {
      const file = picker.files[0]
      picker.value = ''
      if (!file) return
      if (!file.name.endsWith('.zip')) {
        const doContinue = confirm(`Are you sure ${file.name.slice(-20)} is .zip file? Only .zip files are supported. Continue?`)
        if (!doContinue) return
      }
      if (specificCase === 'resourcepack') {
        installTexturePack(file)
      } else {
        openWorldZip(file)
      }
    })
    picker.hidden = true
    document.body.appendChild(picker)
  }

  picker.click()
}

export const resolveTimeout = (promise, timeout = 10000) => {
  return new Promise((resolve, reject) => {
    promise.then(resolve, reject)
    setTimeout(() => {
      reject(new Error('timeout'))
    }, timeout)
  })
}
