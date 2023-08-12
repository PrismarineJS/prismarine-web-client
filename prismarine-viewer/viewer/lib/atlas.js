const fs = require('fs')
const { Canvas, Image } = require('canvas')
const path = require('path')

function nextPowerOfTwo (n) {
  if (n === 0) return 1
  n--
  n |= n >> 1
  n |= n >> 2
  n |= n >> 4
  n |= n >> 8
  n |= n >> 16
  return n + 1
}

function makeTextureAtlas (mcAssets) {
  const blocksTexturePath = path.join(mcAssets.directory, '/blocks')
  const textureFiles = fs.readdirSync(blocksTexturePath).filter(file => file.endsWith('.png'))

  const texSize = nextPowerOfTwo(Math.ceil(Math.sqrt(textureFiles.length)))
  const tileSize = 16

  const imgSize = texSize * tileSize
  const canvas = new Canvas(imgSize, imgSize, 'png')
  const g = canvas.getContext('2d')

  const texturesIndex = {}

  for (const i in textureFiles) {
    const x = (i % texSize) * tileSize
    const y = Math.floor(i / texSize) * tileSize

    const name = textureFiles[i].split('.')[0]

    texturesIndex[name] = { u: x / imgSize, v: y / imgSize, su: tileSize / imgSize, sv: tileSize / imgSize }

    const img = new Image()
    img.src = 'data:image/png;base64,' + fs.readFileSync(path.join(blocksTexturePath, textureFiles[i]), 'base64')
    g.drawImage(img, 0, 0, 16, 16, x, y, 16, 16)
  }

  return { image: canvas.toBuffer(), canvas, json: { size: tileSize / imgSize, textures: texturesIndex } }
}

module.exports = {
  makeTextureAtlas
}
