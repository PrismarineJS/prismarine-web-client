import * as nbt from 'prismarine-nbt'
import { promisify } from 'util'
import { showNotification } from './menus/notification'

const parseNbt = promisify(nbt.parse);

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
  const { files } = e.dataTransfer
  const file = files.item(0)!
  const buffer = await file.arrayBuffer()
  const parsed = await parseNbt(Buffer.from(buffer))
  showNotification({
    message: `${file.name} data available in browser console`,
  })
  console.log('raw', parsed)
  console.log('simplified', nbt.simplify(parsed).Data)
})
