import JSZip from 'jszip'
import fs from 'fs'
import { join } from 'path'
import { fsState } from './loadSave'

const notImplemented = () => {
  return 'Not implemented yet'
}

async function addFolderToZip(folderPath, zip, relativePath) {
  const entries = await fs.promises.readdir(folderPath)

  for (const entry of entries) {
    const entryPath = join(folderPath, entry)
    const stats = await fs.promises.stat(entryPath)

    const zipEntryPath = join(relativePath, entry)

    if (stats.isDirectory()) {
      const subZip = zip.folder(zipEntryPath)
      await addFolderToZip(entryPath, subZip, zipEntryPath)
    } else {
      const fileData = await fs.promises.readFile(entryPath)
      zip.file(entry, fileData)
    }
  }
}


// todo include in help
const exportWorld = async () => {
  // todo issue into chat warning if fs is writable!
  const zip = new JSZip()
  let worldFolder: string = localServer.options.worldFolder
  if (!worldFolder.startsWith('/')) worldFolder = `/${worldFolder}`
  await addFolderToZip(worldFolder, zip, '')

  // Generate the ZIP archive content
  const zipContent = await zip.generateAsync({ type: "blob" })

  // Create a download link and trigger the download
  const downloadLink = document.createElement("a")
  downloadLink.href = URL.createObjectURL(zipContent)
  downloadLink.download = "world-exported.zip"
  downloadLink.click()

  // Clean up the URL object after download
  URL.revokeObjectURL(downloadLink.href)
}

window.exportWorld = exportWorld

const commands = [
  {
    command: ['/download', '/export'],
    invoke: exportWorld
  },
  {
    command: ['/publish'],
    // todo
    invoke: notImplemented
  },
  {
    command: '/reset-world -y',
    invoke: async () => {
      if (fsState.inMemorySave) return
      // todo for testing purposes
      sessionStorage.oldData = localStorage
      console.log('World removed. Old data saved to sessionStorage.oldData')
      localServer.quit()
      // todo browserfs bug
      fs.rmdirSync(localServer.options.worldFolder, { recursive: true })
    }
  },
  {
    command: ['/save'],
    invoke: () => {
      saveWorld()
    }
  }
]

export const tryHandleBuiltinCommand = (message) => {
  if (!localServer) return

  for (const command of commands) {
    if (command.command.includes(message)) {
      command.invoke()
      return true
    }
  }
}

export const saveWorld = async () => {
  for (const player of localServer.players) {
    await player.save()
  }
  const worlds = [localServer.overworld]
  for (const world of worlds) {
    await world.storageProvider.close()
  }
}
