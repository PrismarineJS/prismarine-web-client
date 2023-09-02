import { openWorldZip } from './browserfs'
import { setLoadingScreenStatus } from './utils'
import { filesize } from 'filesize'

window.addEventListener('load', async (e) => {
  const qs = new URLSearchParams(window.location.search)
  const mapUrl = qs.get('map')
  if (!mapUrl) return

  const menu = document.getElementById('play-screen')
  menu.style = 'display: none;'
  const name = mapUrl.slice(mapUrl.lastIndexOf('/') + 1).slice(-25)
  setLoadingScreenStatus(`Downloading world ${name}...`)

  const response = await fetch(mapUrl)
  const contentLength = +response.headers.get('Content-Length')
  setLoadingScreenStatus(`Downloading world ${name}: have to download ${filesize(contentLength)}...`)
  // const reader = response.body!.getReader()
  // let doneValue
  // while (true) {
  //   // done is true for the last chunk
  //   // value is Uint8Array of the chunk bytes
  //   const { done, value } = await reader.read()

  //   if (done) {
  //     doneValue = value
  //     break
  //   }

  //   setLoadingScreenStatus(`Downloading world ${name}: ${filesize(value.length)} / ${filesize(contentLength)}MB...`)
  // }
  await openWorldZip(await response.arrayBuffer())
})

export default async () => {
}
