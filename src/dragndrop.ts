import * as nbt from 'prismarine-nbt'
import { promisify } from 'util'
import { showNotification } from './menus/notification'
import { openWorldDirectory, openWorldZip } from './browserfs'
import { isGameActive } from './globalState'

const parseNbt = promisify(nbt.parse)
window.nbt = nbt;

// todo display drop zone
["drag", "dragstart", "dragend", "dragover", "dragenter", "dragleave", "drop"].forEach(event => {
  window.addEventListener(event, (e: any) => {
    if (e.dataTransfer && !e.dataTransfer.types.includes("Files")) {
      // e.dataTransfer.effectAllowed = "none"
      return
    }
    e.preventDefault()
  })
})
window.addEventListener("drop", async e => {
  if (!e.dataTransfer?.files.length) return
  // todo support drop save folder
  const { items } = e.dataTransfer
  const item = items[0]
  const filehandle = await item.getAsFileSystemHandle() as FileSystemFileHandle | FileSystemDirectoryHandle
  if (filehandle.kind === 'file') {
    const file = await filehandle.getFile()

    if (file.name.endsWith('.zip')) {
      openWorldZip(file)
      return
    }

    const buffer = await file.arrayBuffer()
    const parsed = await parseNbt(Buffer.from(buffer))
    showNotification({
      message: `${file.name} data available in browser console`,
    })
    console.log('raw', parsed)
    console.log('simplified', nbt.simplify(parsed))
  } else {
    if (isGameActive(false)) {
      alert('Exit current world first, before loading a new one.')
      return
    }
    await openWorldDirectory(filehandle as FileSystemDirectoryHandle)
  }
})
