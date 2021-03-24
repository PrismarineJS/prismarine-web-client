import ResourceLocation from '../../utils/ResourceLocation'
import Context2D from '../../renderer/Context2D'
import FocusableGui from '../FocusableGui'

const BACKGROUND_LOCATION = new ResourceLocation('textures/1.16.4/gui/options_background.png')

export default class GuiScreen extends FocusableGui {
  constructor () {
    super();
    this.mc
    this.width
    this.height
    this.children = []
    this.buttons = []
  }

  shouldCloseOnEsc () {
    return true
  }

  initScreen (mcIn, width, height) {
    this.mc = mcIn
    this.width = width
    this.height = height
    this.buttons = []
    this.children = []
    this.listener = null;
    this.init()
  }

  resize(mcIn, width, height) {
    this.initScreen(mcIn, width, height)
  }

  init () {
  }

  render(mouseX, mouseY) {
    for(let i = 0; i < this.buttons.length; ++i) this.buttons[i].render(mouseX, mouseY)
  }

  addButton (button) {
    this.buttons.push(button)
    return this.addListener(button)
  }

  addListener (listener) {
    this.children.push(listener)
    return listener
  }

  getEventListeners () {
    return this.children
  }

  isPauseScreen () {
    return false
  }

  closeScreen() {
    this.mc.displayGuiScreen(null)
  }

  onClose () {
  }

  keyPressed(key) {
    if(key == 'Escape' && this.shouldCloseOnEsc()) {
      this.closeScreen()
      return true
    } else if(key == 'Tab') {
      if(!this.changeFocus(true)) this.changeFocus(false)
      return false
    } else return super.keyPressed(key)
  }

  renderBackground (vOffset = 0) {
    if(this.mc.isInsideWorld) Context2D.fillRect(0, 0, this.width + 1, this.height + 1, 'rgba(0, 0, 0, 0.55');
    else this.renderDirtBackground(vOffset)
  }

  renderDirtBackground (vOffset) {
    this.mc.textureManager.bindImage(BACKGROUND_LOCATION)
    Context2D.setTransform(this.mc.mccanvas.guiScaleFactor + 3 - (3 - this.mc.mccanvas.guiScaleFactor), 0, 0, this.mc.mccanvas.guiScaleFactor + 3 - (3 - this.mc.mccanvas.guiScaleFactor), 0, 0)
    Context2D.createTilePattern(this.width / 32, this.height / 32, 0, 0, 16, 16, 0, vOffset)
    Context2D.setTransform(this.mc.mccanvas.guiScaleFactor, 0, 0, this.mc.mccanvas.guiScaleFactor, 0, 0)

    Context2D.fillRect(0, 0, this.width + 1, this.height + 1, 'rgb(0, 0, 0, 0.75');
  }
}
