// todo implement async options storage

import { proxy, subscribe } from 'valtio/vanilla'
// weird webpack configuration bug: it cant import valtio/utils in this file
import { subscribeKey } from 'valtio/utils'

const mergeAny: <T>(arg1: T, arg2: any) => T = Object.assign

const defaultOptions = {
  renderDistance: 4,
  closeConfirmation: true,
  autoFullScreen: false,
  mouseRawInput: false,
  autoExitFullscreen: false,
  localUsername: 'wanderer',
  mouseSensX: 50,
  mouseSensY: 50 as number | true,
  // mouseInvertX: false,
  chatWidth: 320,
  chatHeight: 180,
  chatScale: 100,
  volume: 50,
  // fov: 70,
  fov: 75,
  guiScale: 3,
  autoRequestCompletions: true,
  touchButtonsSize: 40,
  highPerformanceGpu: false,

  frameLimit: false as number | false,
  alwaysBackupWorldBeforeLoading: undefined as boolean | undefined | null,
  alwaysShowMobileControls: false,
  maxMultiplayerRenderDistance: 6,
  excludeCommunicationDebugEvents: [],
  preventDevReloadWhilePlaying: false,
  numWorkers: 4,
  localServerOptions: {},
  preferLoadReadonly: false,
  disableLoadPrompts: false,
  guestUsername: 'guest',
  askGuestName: true
}

export type AppOptions = typeof defaultOptions

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
  for (const prop of watchedProps) {
    subscribeKey(proxy, prop, () => {
      callback(proxy)
    })
  }
}

watchValue(options, o => {
  globalThis.excludeCommunicationDebugEvents = o.excludeCommunicationDebugEvents
})

export const useOptionValue = (setting, valueCallback) => {
  valueCallback(setting)
  subscribe(setting, valueCallback)
}
