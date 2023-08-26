//@ts-check
import { fsState, loadFolder } from './loadFolder'
import { oneOf } from '@zardoy/utils'
const { promisify } = require('util')
const browserfs = require('browserfs')
const _fs = require('fs')

browserfs.install(window)
// todo migrate to StorageManager API for localsave as localstorage has only 5mb limit, when localstorage is fallback test limit warning on 4mb
browserfs.configure({
  // todo change to localstorage: mkdir doesnt work for some reason
  fs: 'MountableFileSystem',
  options: {
    "/world": { fs: "LocalStorage" }
  },
}, (e) => {
  if (e) throw e
})
//@ts-ignore
_fs.promises = new Proxy(Object.fromEntries(['readFile', 'writeFile', 'stat', 'mkdir', 'rename', /* 'copyFile',  */'readdir'].map(key => [key, promisify(_fs[key])])), {
  get (target, p, receiver) {
    //@ts-ignore
    if (!target[p]) throw new Error(`Not implemented fs.promises.${p}`)
    return (...args) => {
      // browser fs bug: if path doesn't start with / dirname will return . which would cause infinite loop, so we need to normalize paths
      if (typeof args[0] === 'string' && !args[0].startsWith('/')) args[0] = '/' + args[0]
      // Write methods
      // todo issue one-time warning (in chat I guess)
      if (oneOf(p, 'writeFile', 'mkdir', 'rename') && fsState.isReadonly) return
      //@ts-ignore
      return target[p](...args)
    }
  }
})
//@ts-ignore
_fs.promises.open = async (...args) => {
  const fd = await promisify(_fs.open)(...args)
  return {
    ...Object.fromEntries(['read', 'write', 'close'].map(x => [x, async (...args) => {
      return await new Promise(resolve => {
        _fs[x](fd, ...args, (err, bytesRead, buffer) => {
          if (err) throw err
          // todo if readonly probably there is no need to open at all (return some mocked version - check reload)?
          if (x === 'write' && !fsState.isReadonly && fsState.syncFs) {
            // flush data, though alternatively we can rely on close in unload
            _fs.fsync(fd, () => { })
          }
          resolve({ buffer, bytesRead })
        })
      })
    }])),
    // for debugging
    fd,
    filename: args[0],
    close: () => {
      return new Promise(resolve => {
        _fs.close(fd, (err) => {
          if (err) {
            throw err
          } else {
            resolve()
          }
        })
      })
    }
  }
}

const SUPPORT_WRITE = true

export const openWorldDirectory = async (dragndropData) => {
  /** @type {FileSystemDirectoryHandle} */
  let _directoryHandle
  try {
    _directoryHandle = await window.showDirectoryPicker()
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return
    throw err
  }
  const directoryHandle = _directoryHandle

  const requestResult = SUPPORT_WRITE ? await directoryHandle.requestPermission?.({ mode: 'readwrite' }) : undefined
  const writeAccess = requestResult === 'granted'

  const doContinue = writeAccess || !SUPPORT_WRITE || confirm('Continue in readonly mode?')
  if (!doContinue) return
  await new Promise(resolve => {
    browserfs.configure({
      // todo
      fs: 'MountableFileSystem',
      options: {
        "/world": {
          fs: "FileSystemAccess",
          options: {
            handle: directoryHandle
          }
        }
      },
    }, (e) => {
      if (e) throw e
      resolve()
    })
  })

  fsState.isReadonly = !writeAccess
  fsState.syncFs = false
  loadFolder()
}
