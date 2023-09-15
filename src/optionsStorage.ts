// todo implement async options storage

import { proxy, subscribe } from 'valtio/vanilla'
// weird webpack configuration bug: it cant import valtio/utils in this file
import { subscribeKey } from 'valtio/utils'

const mergeAny: <T>(arg1: T, arg2: any) => T = Object.assign

const defaultOptions = {
  renderDistance: 4,
  alwaysBackupWorldBeforeLoading: undefined as boolean | undefined | null,
  alwaysShowMobileControls: false,
  maxMultiplayerRenderDistance: 6,
  excludeCommunicationDebugEvents: [],
  preventDevReloadWhilePlaying: false,
  closeConfirmation: true,
  autoFullScreen: false,
  mouseRawInput: false,
  autoExitFullscreen: false,
  numWorkers: 4,
  localServerOptions: {},
  localUsername: 'wanderer',
  preferLoadReadonly: false,
  disableLoadPrompts: false
}

export const options = proxy(
  mergeAny(defaultOptions, JSON.parse(localStorage.options || '{}'))
)

window.options = window.settings = options

subscribe(options, () => {
  localStorage.options = JSON.stringify(options)
})

type WatchValue = <T extends Record<string, any>>(proxy: T, callback: (p: T) => void) => void

export const watchValue: WatchValue = (proxy, callback) => {
  const watchedProps = new Set<string>()
  callback(new Proxy(proxy, {
    get(target, p, receiver) {
      watchedProps.add(p.toString())
      return Reflect.get(target, p, receiver)
    },
  }))
  watchedProps.forEach(prop => {
    subscribeKey(proxy, prop, () => {
      callback(proxy)
    })
  })
}

watchValue(options, o => {
  globalThis.excludeCommunicationDebugEvents = o.excludeCommunicationDebugEvents
})

export const useOptionValue = (setting, valueCallback) => {
  valueCallback(setting)
  subscribe(setting, valueCallback)
}
