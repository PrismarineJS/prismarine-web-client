/* global THREE performance */

const { Vec3 } = require('vec3')

class Cursor {
  constructor (viewer, renderer) {
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
    for (let i = 0; i < 10; i++) {
      const texture = loader.load('textures/' + viewer.version + '/blocks/destroy_stage_' + i + '.png')
      texture.magFilter = THREE.NearestFilter
      texture.minFilter = THREE.NearestFilter
      this.breakTextures.push(texture)
    }
    const breakMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      alphaTest: 0.1
    })
    this.blockBreakMesh = new THREE.Mesh(blockGeometry, breakMaterial)
    this.blockBreakMesh.visible = false
    viewer.scene.add(this.blockBreakMesh)

    // Setup events
    document.addEventListener('mouseup', (e) => {
      this.buttons[e.button] = false
    })
    document.addEventListener('mousedown', (e) => {
      if (document.pointerLockElement !== renderer.domElement) return
      this.buttons[e.button] = true
    })
  }

  update (bot) {
    let cursorBlock = bot.blockAtCursor(6)
    if (!bot.canDigBlock(cursorBlock)) cursorBlock = null

    let cursorChanged = !cursorBlock !== !this.cursorBlock
    if (cursorBlock && this.cursorBlock) {
      cursorChanged = !cursorBlock.position.equals(this.cursorBlock.position)
    }

    // Place
    if (cursorBlock && this.buttons[2] && (!this.lastButtons[2] || cursorChanged)) {
      const vecArray = [new Vec3(0, -1, 0), new Vec3(0, 1, 0), new Vec3(0, 0, -1), new Vec3(0, 0, 1), new Vec3(-1, 0, 0), new Vec3(1, 0, 0)]
      const delta = cursorBlock.intersect.minus(cursorBlock.position)
      bot._placeBlockWithOptions(cursorBlock, vecArray[cursorBlock.face], { delta, forceLook: 'ignore' })
    }

    // Start break
    if (cursorBlock && this.buttons[0] && (!this.lastButtons[0] || cursorChanged)) {
      this.breakStartTime = performance.now()
      try {
        bot.dig(cursorBlock, 'ignore')
      } catch {} // we don't care if its aborted
    }

    // Stop break
    if (!this.buttons[0] && this.lastButtons[0]) {
      try {
        bot.stopDigging() // this shouldnt throw anything...
      } catch {} // to be reworked in mineflayer, then remove the try here
    }

    // Show break animation
    if (cursorBlock && this.buttons[0]) {
      const elapsed = performance.now() - this.breakStartTime
      const time = bot.digTime(cursorBlock)
      const state = Math.floor((elapsed / time) * 10)
      this.blockBreakMesh.position.set(cursorBlock.position.x + 0.5, cursorBlock.position.y + 0.5, cursorBlock.position.z + 0.5)
      this.blockBreakMesh.material.map = this.breakTextures[state]
      this.blockBreakMesh.visible = true
    } else {
      this.blockBreakMesh.visible = false
    }

    // Show cursor
    if (!cursorBlock) {
      this.cursorMesh.visible = false
    } else {
      this.cursorMesh.visible = true
      this.cursorMesh.position.set(cursorBlock.position.x + 0.5, cursorBlock.position.y + 0.5, cursorBlock.position.z + 0.5)
    }

    // Update state
    this.cursorBlock = cursorBlock
    this.lastButtons[0] = this.buttons[0]
    this.lastButtons[1] = this.buttons[1]
    this.lastButtons[2] = this.buttons[2]
  }
}

module.exports = Cursor
