//@ts-check
/* global THREE performance */

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

class Cursor {
  static instance = null

  constructor (viewer, renderer, /** @type {import('mineflayer').Bot} */bot) {
    bot.on('physicsTick', () => { if (this.lastBlockPlaced < 4) this.lastBlockPlaced++ })
    if (Cursor.instance) return Cursor.instance

    // Init state
    this.buttons = [false, false, false]
    this.lastButtons = [false, false, false]
    this.breakStartTime = 0
    this.cursorBlock = null

    // Setup graphics
    const blockGeometry = new THREE.BoxGeometry(1.001, 1.001, 1.001)
    this.cursorMesh = new THREE.LineSegments(new THREE.EdgesGeometry(blockGeometry), new THREE.LineBasicMaterial({ color: 0 }))
    this.cursorMesh.visible = false
    viewer.scene.add(this.cursorMesh)

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
    this.blockBreakMesh = new THREE.Mesh(blockGeometry, breakMaterial)
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

  // todo this shouldnt be done in the render loop, migrate the code to dom events to avoid delays on lags
  update (/** @type {import('mineflayer').Bot} */bot) {
    const cursorBlock = bot.blockAtCursor(5)
    let cursorBlockDiggable = cursorBlock
    if (!bot.canDigBlock(cursorBlock) && bot.game.gameMode !== 'creative') cursorBlockDiggable = null

    let cursorChanged = !cursorBlock !== !this.cursorBlock
    if (cursorBlock && this.cursorBlock) {
      cursorChanged = !cursorBlock.position.equals(this.cursorBlock.position)
    }

    // Place
    if (cursorBlock && this.buttons[2] && (!this.lastButtons[2] || cursorChanged) && this.lastBlockPlaced >= 4) {
      const vecArray = [new Vec3(0, -1, 0), new Vec3(0, 1, 0), new Vec3(0, 0, -1), new Vec3(0, 0, 1), new Vec3(-1, 0, 0), new Vec3(1, 0, 0)]
      //@ts-ignore
      const delta = cursorBlock.intersect.minus(cursorBlock.position)
      // check instead?
      //@ts-ignore
      bot._placeBlockWithOptions(cursorBlock, vecArray[cursorBlock.face], { delta, forceLook: 'ignore' }).catch(console.warn)
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
    if (!cursorBlock) {
      this.cursorMesh.visible = false
    } else {
      for (const collisionData of [...cursorBlock.shapes, ...cursorBlock['interactionShapes'] ?? []].slice(0, 1) ?? []) {
        const width = collisionData[3] - collisionData[0]
        const height = collisionData[4] - collisionData[1]
        const depth = collisionData[5] - collisionData[2]

        const initialSize = 1.001
        this.cursorMesh.scale.set(width * initialSize, height * initialSize, depth * initialSize)
        this.blockBreakMesh.scale.set(width * initialSize, height * initialSize, depth * initialSize)
        // this.cursorMesh.position.set(cursorBlock.position.x + 0.5, cursorBlock.position.y + 0.5, cursorBlock.position.z + 0.5)
        const centerX = (collisionData[3] + collisionData[0]) / 2
        const centerY = (collisionData[4] + collisionData[1]) / 2
        const centerZ = (collisionData[5] + collisionData[2]) / 2
        this.cursorMesh.position.set(cursorBlock.position.x + centerX, cursorBlock.position.y + centerY, cursorBlock.position.z + centerZ)
        this.blockBreakMesh.position.set(cursorBlock.position.x + centerX, cursorBlock.position.y + centerY, cursorBlock.position.z + centerZ)
      }
      this.cursorMesh.visible = true
      // change
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

export default Cursor
