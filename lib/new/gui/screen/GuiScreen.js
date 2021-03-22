import ResourceLocation from '../../utils/ResourceLocation'
import Context2D from '../../renderer/Context2D'
import FocusableGui from '../FocusableGui'

const BACKGROUND_LOCATION = new ResourceLocation('textures/gui/options_background.png')

export default class GuiScreen extends FocusableGui {
  constructor () {
    super();
    this.mc
    this.width
    this.height
    this.children = []
    this.buttons = []
  }

  initScreen (mcIn, width, height) {
    this.mc = mcIn
    this.width = width
    this.height = height
    this.buttons = []
    this.children = []
    this.setListener(null)
    this.init()
  }

  resize (mcIn, width, height) {
    this.initScreen(mcIn, width, height)
  }

  init () {
  }

  render (mouseX, mouseY) {
    for (let i = 0; i < this.buttons.length; ++i) this.buttons[i].render(mouseX, mouseY)
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

  shouldCloseOnEsc () {
    return true
  }

  closeScreen () {
    this.mc.displayGuiScreen(null)
  }

  onClose () {
  }

  keyPressed (key, modifiers) {
    if (key == 'Escape' && this.shouldCloseOnEsc()) {
      this.closeScreen()
      return true
    } else if (key == 'Tab') {
      if (!this.changeFocus(true)) this.changeFocus(false)
      return false
    } else {
      return super.keyPressed(key, modifiers)
    }
  }

  renderBackground (vOffset = 0) {
    if (this.mc.isInsideWorld) {
      Context2D.setAlpha(0.55)
      Context2D.fillRect(0, 0, this.width + 1, this.height + 1, 'black')
      Context2D.setAlpha(1)
    } else {
      this.renderDirtBackground(vOffset)
    }
  }

  renderDirtBackground (vOffset) {
    this.mc.getTextureManager().bindImage(BACKGROUND_LOCATION)
    Context2D.setTransform(this.mc.mccanvas.getGuiScaleFactor() + 3 - (3 - this.mc.mccanvas.getGuiScaleFactor()), 0, 0, this.mc.mccanvas.getGuiScaleFactor() + 3 - (3 - this.mc.mccanvas.getGuiScaleFactor()), 0, 0)
    Context2D.createTilePattern(this.width / 32, this.height / 32, 0, 0, 16, 16, 0, vOffset)
    Context2D.setTransform(this.mc.mccanvas.getGuiScaleFactor(), 0, 0, this.mc.mccanvas.getGuiScaleFactor(), 0, 0)

    Context2D.setAlpha(0.75)
    Context2D.fillRect(0, 0, this.width + 1, this.height + 1, 'black')
    Context2D.setAlpha(1)
  }
}
