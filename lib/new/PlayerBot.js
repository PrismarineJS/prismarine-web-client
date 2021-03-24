import Minecraft, { viewer } from "../..";

const codes = {
  KeyW: 'forward',
  KeyS: 'back',
  KeyA: 'right',
  KeyD: 'left',
  Space: 'jump',
  ShiftLeft: 'sneak',
  ControlLeft: 'sprint'
}

export default class PlayerBot {
  /** @param {Minecraft} mc */
  constructor(mc, bot) {
    this.mc = mc;
    /** @type {import("mineflayer").Bot} */
    this.bot = bot;

    this.health = this.bot.health;
    this.maxHealth = 20;
    this.foodLevel = this.bot.food;
    this.foodSaturationLevel = this.bot.foodSaturation;
    this.experience = 0;
    this.experienceLevel = 0;
  }

  updateCursor() {
    let cursorMesh = this.mc.world.cursorMesh;
    if(cursorMesh) {
      const cursorBlock = this.bot.blockAtCursor();
      if(!cursorBlock || !this.bot.canDigBlock(cursorBlock)) {
        cursorMesh.visible = false
        return
      } else cursorMesh.visible = true;
      cursorMesh.position.set(cursorBlock.position.x + 0.5, cursorBlock.position.y + 0.5, cursorBlock.position.z + 0.5)
    }
  }

  updateBotMovement(e) {
    this.bot.entity.pitch -= e.movementY * this.mc.gameSettings.mouseSensYValue;
    this.bot.entity.pitch = Math.max(-0.5 * Math.PI, Math.min(0.5 * Math.PI, this.bot.entity.pitch));
    this.bot.entity.yaw -= e.movementX * this.mc.gameSettings.mouseSensXValue;
  }

  updateBotPosition() {
    viewer.setFirstPersonCamera(this.bot.entity.position, this.bot.entity.yaw, this.bot.entity.pitch)
    this.mc.world.worldView.updatePosition(this.bot.entity.position)
  }

  updateAttributes() {
    this.health = this.bot.health
    this.foodLevel = this.bot.food
    this.foodSaturationLevel = this.bot.foodSaturation
    this.experience = this.bot.experience;
  }

  dropHeldItem() {
    if(this.bot.held) {
      this.bot.tossStack(this.bot.heldItem);
    }
  }

  placeBlockInWorld() {
    const cursorBlock = this.bot.blockAtCursor();
    if(cursorBlock) {
      const vecArray = [new Vec3(0, -1, 0), new Vec3(0, 1, 0), new Vec3(0, 0, -1), new Vec3(0, 0, 1), new Vec3(-1, 0, 0), new Vec3(1, 0, 0)]
      const vec = vecArray[cursorBlock.face]
      const delta = cursorBlock.intersect.minus(cursorBlock.position);
      this.bot._placeBlockWithOptions(cursorBlock, vec, { delta, forceLook: 'ignore' })
    }
  }

  digBlockInWorld() {
    const cursorBlock = this.bot.blockAtCursor();
    if(cursorBlock) {
      if(this.bot.canDigBlock(cursorBlock)) this.bot.dig(cursorBlock, 'ignore');
    }
  }

  stopDigging() {
    this.bot.stopDigging();
  }

  updateBotControlsState(code, action) {
    if(code in codes) {
      this.bot.setControlState(codes[code], action == 1);
    }
  }
}