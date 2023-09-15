//@ts-check

import { join } from 'path'
import { miscUiState } from './globalState'
import { fromTexturePackPath } from './texturePack'
import fs from 'fs'
import { subscribeKey } from 'valtio/utils'

let panoramaCubeMap
let panoramaUsesResourePack = false
let viewer

export const initPanoramaOptions = (_viewer) => {
  viewer = _viewer
}

const panoramaFiles = [
  'panorama_1.png', // WS
  'panorama_3.png', // ES
  'panorama_4.png', // Up
  'panorama_5.png', // Down
  'panorama_0.png', // NS
  'panorama_2.png' // SS
]

const panoramaResourcePackPath = 'assets/minecraft/textures/gui/title/background'
const possiblyLoadPanoramaFromResourcePack = async (file) => {
  let base64Texture
  if (panoramaUsesResourePack) {
    try {
      base64Texture = await fs.promises.readFile(fromTexturePackPath(join(panoramaResourcePackPath, file)), 'base64')
    } catch (err) {
      panoramaUsesResourePack = false
    }
  }
  if (base64Texture) return `data:image/png;base64,${base64Texture}`
  else return join('extra-textures/background', file)
}

const updateResourecePackSupportPanorama = async () => {
  try {
    await fs.promises.readFile(fromTexturePackPath(join(panoramaResourcePackPath, panoramaFiles[0])), 'base64')
    panoramaUsesResourePack = true
  } catch (err) {
    panoramaUsesResourePack = false
  }
}

subscribeKey(miscUiState, 'resourcePackInstalled', async () => {
  const oldState = panoramaUsesResourePack
  const newState = miscUiState.resourcePackInstalled && (await updateResourecePackSupportPanorama(), panoramaUsesResourePack)
  if (newState === oldState) return
  removePanorama()
  addPanoramaCubeMap()
})

// Menu panorama background
export async function addPanoramaCubeMap () {
  // remove all existing object in the viewer.scene
  // viewer.scene.children = []

  let time = 0
  viewer.camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.05, 1000)
  viewer.camera.updateProjectionMatrix()
  viewer.camera.position.set(0, 0, 0)
  viewer.camera.rotation.set(0, 0, 0)
  const panorGeo = new THREE.BoxGeometry(1000, 1000, 1000)

  const loader = new THREE.TextureLoader()
  let panorMaterials = []
  await updateResourecePackSupportPanorama()
  for (const file of panoramaFiles) {
    panorMaterials.push(new THREE.MeshBasicMaterial({
      map: loader.load(await possiblyLoadPanoramaFromResourcePack(file)),
      transparent: true,
      side: THREE.DoubleSide
    }))
  }

  const panoramaBox = new THREE.Mesh(panorGeo, panorMaterials)

  panoramaBox.onBeforeRender = () => {
    time += 0.01
    panoramaBox.rotation.y = Math.PI + time * 0.01
    panoramaBox.rotation.z = Math.sin(-time * 0.001) * 0.001
  }

  const group = new THREE.Object3D()
  group.add(panoramaBox)

  const Entity = require('prismarine-viewer/viewer/lib/entity/Entity')
  for (let i = 0; i < 42; i++) {
    const m = new Entity('1.16.4', 'squid').mesh
    m.position.set(Math.random() * 30 - 15, Math.random() * 20 - 10, Math.random() * 10 - 17)
    m.rotation.set(0, Math.PI + Math.random(), -Math.PI / 4, 'ZYX')
    const v = Math.random() * 0.01
    m.children[0].onBeforeRender = () => {
      m.rotation.y += v
      m.rotation.z = Math.cos(panoramaBox.rotation.y * 3) * Math.PI / 4 - Math.PI / 2
    }
    group.add(m)
  }

  viewer.scene.add(group)
  panoramaCubeMap = group
}

export function removePanorama () {
  if (!panoramaCubeMap) return
  viewer.camera = new THREE.PerspectiveCamera(document.getElementById('options-screen').fov, window.innerWidth / window.innerHeight, 0.1, 1000)
  viewer.camera.updateProjectionMatrix()
  viewer.scene.remove(panoramaCubeMap)
}
