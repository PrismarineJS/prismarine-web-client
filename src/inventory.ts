import { subscribe } from 'valtio'
import { showInventory } from 'minecraft-inventory-gui/web/ext.mjs'
import InventoryGui from 'minecraft-assets/minecraft-assets/data/1.17.1/gui/container/inventory.png'
import Dirt from 'minecraft-assets/minecraft-assets/data/1.17.1/blocks/dirt.png'
import { subscribeKey } from 'valtio/utils'
import MinecraftData from 'minecraft-data'
import { getVersion } from 'prismarine-viewer/viewer/lib/version'
import invspriteJson from './invsprite.json'
import { activeModalStack, hideCurrentModal, miscUiState } from './globalState'

const loadedImages = new Map<string, HTMLImageElement>()
export type BlockStates = Record<string, null | {
  variants: Record<string, Array<{
    model: {
      textures: {
        up: {
          u
          v
          su
          sv
        }
      }
    }
  }>>
}>

let blockStates: BlockStates
let lastInventory
let mcData
let version

subscribeKey(miscUiState, 'gameLoaded', async () => {
  if (!miscUiState.gameLoaded) {
    // loadedBlocksAtlas = null
    return
  }

  // on game load
  version = getVersion(bot.version)
  blockStates = await fetch(`blocksStates/${version}.json`).then(async res => res.json())
  getImage({ path: 'blocks', } as any)
  getImage({ path: 'invsprite', } as any)
  mcData = MinecraftData(version)
})

const findBlockStateTexturesAtlas = (name) => {
  const vars = blockStates[name]?.variants
  if (!vars) return
  const firstVar = Object.values(vars)[0]
  if (!firstVar || !Array.isArray(firstVar)) return
  return firstVar[0]?.model.textures
}

const getBlockData = (name) => {
  const blocksImg = loadedImages.get('blocks')
  if (!blocksImg?.width) return

  const data = findBlockStateTexturesAtlas(name)
  if (!data) return

  const getSpriteBlockSide = (side) => {
    const d = data[side]
    if (!d) return
    const spriteSide = [d.u * blocksImg.width, d.v * blocksImg.height, d.su * blocksImg.width, d.sv * blocksImg.height]
    const blockSideData = {
      slice: spriteSide,
      path: 'blocks'
    }
    return blockSideData
  }

  return {
    // todo look at grass bug
    top: getSpriteBlockSide('up') || getSpriteBlockSide('top'),
    left: getSpriteBlockSide('east') || getSpriteBlockSide('side'),
    right: getSpriteBlockSide('north') || getSpriteBlockSide('side'),
  }
}

const getItemSlice = (name) => {
  const invspriteImg = loadedImages.get('invsprite')
  if (!invspriteImg?.width) return

  const { x, y } = invspriteJson[name] ?? /* unknown item */ { x: 0, y: 0 }
  const sprite = [x, y, 32, 32]
  return sprite
}

const getImageSrc = (path) => {
  switch (path) {
    case 'gui/container/inventory': return InventoryGui
    case 'blocks': return globalThis.texturePackDataUrl || `textures/${version}.png`
    case 'invsprite': return `invsprite.png`
  }
  return Dirt
}

const getImage = ({ path, texture, blockData }) => {
  const loadPath = blockData ? 'blocks' : path ?? texture
  if (!loadedImages.has(loadPath)) {
    const image = new Image()
    // image.onload(() => {})
    image.src = getImageSrc(loadPath)
    loadedImages.set(loadPath, image)
  }
  return loadedImages.get(loadPath)
}

const upInventory = () => {
  // inv.pwindow.inv.slots[2].displayName = 'test'
  // inv.pwindow.inv.slots[2].blockData = getBlockData('dirt')
  const customSlots = bot.inventory.slots.map(slot => {
    if (!slot) return
    // const itemName = slot.name
    // const isItem = mcData.itemsByName[itemName]

    // try get block data first, but ideally we should also have atlas from atlas/ folder
    const blockData = getBlockData(slot.name)
    if (blockData) {
      slot['texture'] = 'blocks'
      slot['blockData'] = blockData
    } else {
      slot['texture'] = 'invsprite'
      slot['scale'] = 0.5
      slot['slice'] = getItemSlice(slot.name)
    }

    return slot
  })
  lastInventory.pwindow.setSlots(customSlots)
}

subscribe(activeModalStack, () => {
  const inventoryOpened = activeModalStack.at(-1)?.reactType === 'inventory'
  if (inventoryOpened) {
    const inv = showInventory(undefined, getImage, {}, bot)
    inv.canvas.style.zIndex = 10
    inv.canvas.style.position = 'fixed'
    inv.canvas.style.inset = '0'
    // todo scaling
    inv.canvasManager.setScale(window.innerHeight < 480 ? 2 : window.innerHeight < 700 ? 3 : 4)
    inv.canvasManager.onClose = () => {
      hideCurrentModal()
      inv.canvasManager.destroy()
    }

    lastInventory = inv
    upInventory()
  } else if (lastInventory) {
    lastInventory.destroy()
    lastInventory = null
  }
})
