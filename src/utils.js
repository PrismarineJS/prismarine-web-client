//@ts-check
import { activeModalStack, miscUiState, showModal } from './globalState'
import { notification } from './menus/notification'
import * as crypto from 'crypto'
import UUID from 'uuid-1345'
import { options } from './optionsStorage'
import { saveWorld } from './builtinCommands'

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
  get hasPointerLock () {
    return document.pointerLockElement
  },
  justHitEscape: false,
  async requestPointerLock () {
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
      /** @type {any} */
      //@ts-ignore
      const promise = document.documentElement.requestPointerLock({
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
export function getScreenRefreshRate () {
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
function javaUUID (s) {
  const hash = crypto.createHash('md5')
  hash.update(s, 'utf8')
  const buffer = hash.digest()
  buffer[6] = (buffer[6] & 0x0f) | 0x30
  buffer[8] = (buffer[8] & 0x3f) | 0x80
  return buffer
}

export function nameToMcOfflineUUID (name) {
  return (new UUID(javaUUID('OfflinePlayer:' + name))).toString()
}

export const setLoadingScreenStatus = function (/** @type {string} */status, isError = false) {
  const loadingScreen = document.getElementById('loading-error-screen')

  // todo update in component instead
  showModal(loadingScreen)
  if (loadingScreen.hasError) {
    miscUiState.gameLoaded = false
    return
  }
  loadingScreen.hasError = isError
  loadingScreen.status = status
}


export const disconnect = async () => {
  if (window.localServer) {
    await saveWorld()
    localServer.quit()
  }
  bot._client.emit('end')
  miscUiState.gameLoaded = false
}

export const loadScript = async function (/** @type {string} */ scriptSrc) {
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
