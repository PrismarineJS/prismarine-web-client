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

  let downloadedBytes = 0
  const buffer = await new Response(
    new ReadableStream({
      async start(controller) {
        const reader = response.body.getReader()

        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            controller.close()
            break
          }

          downloadedBytes += value.byteLength

          // Calculate download progress as a percentage
          const progress = (downloadedBytes / contentLength) * 100

          // Update your progress bar or display the progress value as needed
          setLoadingScreenStatus(`Download Progress: ${Math.floor(progress)}% (${filesize(downloadedBytes, { round: 2, })} / ${filesize(contentLength, { round: 2, })}))`, false, true)

          // Pass the received data to the controller
          controller.enqueue(value)
        }
      },
    })
  ).arrayBuffer()
  await openWorldZip(buffer)
})

export default async () => {
}
