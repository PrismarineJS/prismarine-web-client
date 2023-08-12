const THREE = require('three')
const path = require('path')

const textureCache = {}
function loadTexture (texture, cb) {
  if (!textureCache[texture]) {
    const url = path.resolve(__dirname, '../../public/' + texture)
    textureCache[texture] = new THREE.TextureLoader().load(url)
  }
  cb(textureCache[texture])
}

function loadJSON (json, cb) {
  cb(require(path.resolve(__dirname, '../../public/' + json)))
}

module.exports = { loadTexture, loadJSON }
