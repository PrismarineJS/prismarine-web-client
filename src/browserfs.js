//@ts-check
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
_fs.promises = new Proxy(Object.fromEntries(['readFile', 'writeFile', 'stat', 'mkdir'].map(key => [key, promisify(_fs[key])])), {
  get (target, p, receiver) {
    //@ts-ignore
    if (!target[p]) throw new Error(`Not implemented fs.promises.${p}`)
    return (...args) => {
      // browser fs bug: if path doesn't start with / dirname will return . which would cause infinite loop, so we need to normalize paths
      if (typeof args[0] === 'string' && !args[0].startsWith('/')) args[0] = '/' + args[0]
      //@ts-ignore
      return target[p](...args)
    }
  }
})
//@ts-ignore
_fs.promises.open = async (...args) => {
  const fd = await promisify(_fs.open)(...args)
  return Object.fromEntries(['read', 'write', 'close'].map(x => [x, async (...args) => {
    return await new Promise(resolve => {
      _fs[x](fd, ...args, (err, bytesRead, buffer) => {
        if (err) throw err
        if (x === 'write') {
          // flush data, though alternatively we can rely on close in unload
          _fs.fsync(fd, () => { })
        }
        resolve({ buffer, bytesRead })
      })
    })
  }]))
}
