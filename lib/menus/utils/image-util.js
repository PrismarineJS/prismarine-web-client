import { layouts } from 'minecraft-inventory-gui/lib/layouts.mjs'

const invspritePositions = require('../../invsprite.json')

globalThis.layouts = layouts

const IMAGE_ROOT = 'https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.16.4/'

function patchPath (path) {
  if (IMAGE_ROOT.includes('.com')) { path = path.replace('block/', 'blocks/'); path = path.replace('item/', 'items/') }
  // if (path.includes('enchant_table_anim'))path='enchant_table_anims2'
  console.log(path)
  return path
}

const images = []

for (const win in layouts) { // Preload layouts
  const val = layouts[win]
  for (const key in val.with) {
    const path = val.with[key].path
    if (path && !images.includes(path)) {
      images.push(path)
    }
  }
}

const loadedImageBlobs = [] // Caching array

function loadAllImagesWeb () { // Preload all images
  for (const path of images) {
    const img = new window.Image() // Create new img element
    img.src = patchPath(IMAGE_ROOT + path) + '.png' // Set source path
    img.onload = function () {
      loadedImageBlobs[path] = this
    }
  }
}

function loadRuntimeImage (atPath) {
  const img = new window.Image() // Create new img element
  // if (IMAGE_ROOT.includes('.com')) {atPath = atPath.replace('block/', 'blocks/');atPath=atPath.replace('item/', 'items/')}
  img.src = patchPath(IMAGE_ROOT + atPath) + '.png' // Set source path
  img.style.imageRendering = 'pixelated'
  // img.onload = function () {
  //   loadedImageBlobs[path] = this
  // }
  loadedImageBlobs[atPath] = img
}

export function getImage (resource) {
  // console.log('getImage triggered with arguments:', resource)
  if ((resource.type ?? 'gui') !== 'item') { // nullishly coalesce to 'gui' because spec says to assume gui if unspecified. Run old code if it isn't an item because the new code is for items lol
    let path = patchPath(resource.path)

    if (!path && resource.with.startsWith('item.')) { // Temp to load image icons
      path = resource.with.replace('.', '/')
      loadRuntimeImage(path)
    }

    if (!loadedImageBlobs[path]) {
      loadRuntimeImage(path)
    }

    return loadedImageBlobs[path]
  }
  // run new code if type isn't gui (aka type is item)

  const img = new window.Image(32, 32) // Create new img element
  img.src = 'invsprite.png' // see assets/invsprite.png
  img.style.imageRendering = 'pixelated' // antialiasing bad in block game
  // img.style.objectFit = 'none'
  // img.style.objectPosition = invspritePositions[resource.item.type].x + 'px ' + invspritePositions[resource.item.type].y + 'px'
  const metaImg = {
    image: img,
    x: invspritePositions[resource.item.type].x,
    y: invspritePositions[resource.item.type].y,
    width: 32,
    height: 32,
    scale: 0.5
  }
  return metaImg
}

loadAllImagesWeb()
