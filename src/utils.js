//@ts-check
import { activeModalStack, miscUiState } from './globalState'
import { notification } from './menus/notification'

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
    const autoFullScreen = window.localStorage.getItem('autoFullscreen') === 'true'
    if (autoFullScreen) {
      await goFullscreen()
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
        unadjustedMovement: window.localStorage.getItem('mouseRawInput') === 'true'
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
