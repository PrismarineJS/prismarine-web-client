//@ts-check

// wouldn't better to create atlas instead?
import destroyStage0 from 'minecraft-assets/minecraft-assets/data/1.10/blocks/destroy_stage_0.png'
import destroyStage1 from 'minecraft-assets/minecraft-assets/data/1.10/blocks/destroy_stage_1.png'
import destroyStage2 from 'minecraft-assets/minecraft-assets/data/1.10/blocks/destroy_stage_2.png'
import destroyStage3 from 'minecraft-assets/minecraft-assets/data/1.10/blocks/destroy_stage_3.png'
import destroyStage4 from 'minecraft-assets/minecraft-assets/data/1.10/blocks/destroy_stage_4.png'
import destroyStage5 from 'minecraft-assets/minecraft-assets/data/1.10/blocks/destroy_stage_5.png'
import destroyStage6 from 'minecraft-assets/minecraft-assets/data/1.10/blocks/destroy_stage_6.png'
import destroyStage7 from 'minecraft-assets/minecraft-assets/data/1.10/blocks/destroy_stage_7.png'
import destroyStage8 from 'minecraft-assets/minecraft-assets/data/1.10/blocks/destroy_stage_8.png'
import destroyStage9 from 'minecraft-assets/minecraft-assets/data/1.10/blocks/destroy_stage_9.png'

import { Vec3 } from 'vec3'
import { isGameActive } from './globalState'

function getViewDirection (pitch, yaw) {
  const csPitch = Math.cos(pitch)
  const snPitch = Math.sin(pitch)
  const csYaw = Math.cos(yaw)
  const snYaw = Math.sin(yaw)
  return new Vec3(-snYaw * csPitch, snPitch, -csYaw * csPitch)
}

class BlockInteraction {
  static instance = null
  /** @type {null | {blockPos,mesh}} */
  interactionLines = null

  init () {
    bot.on('physicsTick', () => { if (this.lastBlockPlaced < 4) this.lastBlockPlaced++ })

    // Init state
    this.buttons = [false, false, false]
    this.lastButtons = [false, false, false]
    this.breakStartTime = 0
    this.cursorBlock = null

    const loader = new THREE.TextureLoader()
    this.breakTextures = []
    const destroyStagesImages = [
      destroyStage0,
      destroyStage1,
      destroyStage2,
      destroyStage3,
      destroyStage4,
      destroyStage5,
      destroyStage6,
      destroyStage7,
      destroyStage8,
      destroyStage9
    ]
    for (let i = 0; i < 10; i++) {
      const texture = loader.load(destroyStagesImages[i])
      texture.magFilter = THREE.NearestFilter
      texture.minFilter = THREE.NearestFilter
      this.breakTextures.push(texture)
    }
    const breakMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      blending: THREE.MultiplyBlending
    })
    this.blockBreakMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), breakMaterial)
    this.blockBreakMesh.visible = false
    this.blockBreakMesh.renderOrder = 999
    viewer.scene.add(this.blockBreakMesh)

    // Setup events
    document.addEventListener('mouseup', (e) => {
      this.buttons[e.button] = false
    })

    this.lastBlockPlaced = 4 // ticks since last placed
    document.addEventListener('mousedown', (e) => {
      if (e.isTrusted && !document.pointerLockElement) return
      if (!isGameActive(true)) return
      this.buttons[e.button] = true

      const entity = bot.nearestEntity((e) => {
        if (e.position.distanceTo(bot.entity.position) <= (bot.game.gameMode === 'creative' ? 5 : 3)) {
          const dir = getViewDirection(bot.entity.pitch, bot.entity.yaw)
          const { width, height } = e
          const { x: eX, y: eY, z: eZ } = e.position
          const { x: bX, y: bY, z: bZ } = bot.entity.position
          const box = new THREE.Box3(
            new THREE.Vector3(eX - width / 2, eY, eZ - width / 2),
            new THREE.Vector3(eX + width / 2, eY + height, eZ + width / 2)
          )

          const r = new THREE.Raycaster(
            new THREE.Vector3(bX, bY + 1.52, bZ),
            new THREE.Vector3(dir.x, dir.y, dir.z)
          )
          const int = r.ray.intersectBox(box, new THREE.Vector3(eX, eY, eZ))
          return int !== null
        }

        return false
      })

      if (entity) {
        bot.attack(entity)
      }
    })
  }

  updateBlockInteractionLines (/** @type {Vec3 | null} */blockPos, /** @type {{position, width, height, depth}[]} */shapePositions = undefined) {
    if (this.interactionLines !== null) {
      viewer.scene.remove(this.interactionLines.mesh)
      this.interactionLines = null
    }
    if (blockPos === null || (this.interactionLines && blockPos.equals(this.interactionLines.blockPos))) {
      return
    }

    const group = new THREE.Group()
    for (const { position, width, height, depth } of shapePositions) {
      const geometry = new THREE.BoxGeometry(1.001 * width, 1.001 * height, 1.001 * depth)
      const mesh = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0 }))
      const pos = blockPos.plus(position)
      mesh.position.set(pos.x, pos.y, pos.z)
      group.add(mesh)
    }
    viewer.scene.add(group)
    this.interactionLines = { blockPos, mesh: group }
  }

  // todo this shouldnt be done in the render loop, migrate the code to dom events to avoid delays on lags
  // eslint-disable-next-line complexity
  update () {
    const cursorBlock = bot.blockAtCursor(5)
    let cursorBlockDiggable = cursorBlock
    if (!bot.canDigBlock(cursorBlock) && bot.game.gameMode !== 'creative') cursorBlockDiggable = null

    let cursorChanged = !cursorBlock !== !this.cursorBlock
    if (cursorBlock && this.cursorBlock) {
      cursorChanged = !cursorBlock.position.equals(this.cursorBlock.position)
    }

    // Place / interact
    if (this.buttons[2] && (!this.lastButtons[2] || cursorChanged) && this.lastBlockPlaced >= 4) {
      const vecArray = [new Vec3(0, -1, 0), new Vec3(0, 1, 0), new Vec3(0, 0, -1), new Vec3(0, 0, 1), new Vec3(-1, 0, 0), new Vec3(1, 0, 0)]
      //@ts-expect-error
      const delta = cursorBlock.intersect.minus(cursorBlock.position)

      // workaround so blocks can be activated with empty hand
      const oldHeldItem = bot.heldItem
      //@ts-expect-error
      bot.heldItem = true
      //@ts-expect-error
      bot._placeBlockWithOptions(cursorBlock, vecArray[cursorBlock.face], { delta, forceLook: 'ignore' }).catch(console.warn)
      bot.heldItem = oldHeldItem
      this.lastBlockPlaced = 0
    }

    // Start break
    // todo last check doesnt work as cursorChanged happens once (after that check is false)
    if (cursorBlockDiggable && this.buttons[0] && (!this.lastButtons[0] || (cursorChanged && Date.now() - (this.lastDigged ?? 0) > 100))) {
      this.breakStartTime = performance.now()
      bot.dig(cursorBlock, 'ignore').catch((err) => {
        if (err.message === 'Digging aborted') return
        throw err
      })
      this.lastDigged = Date.now()
    }

    // Stop break
    if (!this.buttons[0] && this.lastButtons[0]) {
      try {
        bot.stopDigging() // this shouldnt throw anything...
      } catch (e) { } // to be reworked in mineflayer, then remove the try here
    }

    // Show cursor
    if (cursorBlock) {
      const allShapes = [...cursorBlock.shapes, ...cursorBlock['interactionShapes'] ?? []]
      this.updateBlockInteractionLines(cursorBlock.position, allShapes.map(shape => {
        return getDataFromShape(shape)
      }))
      {
        // union of all values
        const breakShape = allShapes.reduce((acc, cur) => {
          return [
            Math.min(acc[0], cur[0]),
            Math.min(acc[1], cur[1]),
            Math.min(acc[2], cur[2]),
            Math.max(acc[3], cur[3]),
            Math.max(acc[4], cur[4]),
            Math.max(acc[5], cur[5])
          ]
        })
        const { position, width, height, depth } = getDataFromShape(breakShape)
        this.blockBreakMesh.scale.set(width * 1.001, height * 1.001, depth * 1.001)
        position.add(cursorBlock.position)
        this.blockBreakMesh.position.set(position.x, position.y, position.z)
      }
    } else {
      this.updateBlockInteractionLines(null)
    }

    // Show break animation
    if (cursorBlockDiggable && this.buttons[0]) {
      const elapsed = performance.now() - this.breakStartTime
      const time = bot.digTime(cursorBlock)
      const state = Math.floor((elapsed / time) * 10)
      this.blockBreakMesh.material.map = this.breakTextures[state]
      this.blockBreakMesh.visible = true
    } else {
      this.blockBreakMesh.visible = false
    }

    // Update state
    this.cursorBlock = cursorBlock
    this.lastButtons[0] = this.buttons[0]
    this.lastButtons[1] = this.buttons[1]
    this.lastButtons[2] = this.buttons[2]
  }
}

const getDataFromShape = (shape) => {
  const width = shape[3] - shape[0]
  const height = shape[4] - shape[1]
  const depth = shape[5] - shape[2]
  const centerX = (shape[3] + shape[0]) / 2
  const centerY = (shape[4] + shape[1]) / 2
  const centerZ = (shape[5] + shape[2]) / 2
  const position = new Vec3(centerX, centerY, centerZ)
  return { position, width, height, depth }
}

export default new BlockInteraction()
