import { getMCInstance } from '../../../..'
import ResourceLocation from '../../utils/ResourceLocation'
import AbstractGui from '../AbstractGui'
import Context2D from '../../renderer/Context2D'

export const WIDGETS_LOCATION = new ResourceLocation('textures/1.16.4/gui/widgets.png')

export default class Widget extends AbstractGui {
  constructor (x, y, width, height, title) {
    super()
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.message = title

    this.active = true
    this.focused = false
    this.isHovered = false
    this.visible = true
    this.alpha = 1
  }

  render(mouseX, mouseY) {
    if(this.visible) {
      this.isHovered = mouseX >= this.x && mouseY >= this.y && mouseX < this.x + this.width && mouseY < this.y + this.height
      this.renderButton(mouseX, mouseY);
    }
  }

  getYImage(hovered) {
    if(!this.active) return 0;
    else if(hovered) return 2;
    return 1;
  }

  renderButton(mouseX, mouseY) {
    const mc = getMCInstance();
    const yUV = this.getYImage(this.getIsHovered()); 
    mc.textureManager.bindImage(WIDGETS_LOCATION)
    this.blit(this.x, this.y, 0, 46 + yUV * 20, this.width / 2, this.height)
    this.blit(this.x + this.width / 2, this.y, 200 - this.width / 2, 46 + yUV * 20, this.width / 2, this.height);
    this.renderBg(mc, mouseX, mouseY);
    let color = this.active ? 'white' : 'rgb(160, 160, 160)';
    Context2D.drawCenteredText(this.message, this.x + this.width / 2, this.y + (this.height + 6) / 2, color)
  }

  renderBg(minecraft, mouseX, mouseY) {
  }

  onClick (mouseX, mouseY) {
  }

  onRelease (mouseX, mouseY) {
  }

  onDrag (mouseX, mouseY, dragX, dragY) {
  }

  mouseMoved(xPos, yPos) {
    return false
  }

  mouseDragged (mouseX, mouseY, button, dragX, dragY) {
    if (this.isValidClickButton(button)) {
      this.onDrag(mouseX, mouseY, dragX, dragY)
      return true
    } else return false
  }

  mouseClicked (mouseX, mouseY, button) {
    if (this.active && this.visible) {
      if (this.isValidClickButton(button)) {
        const flag = this.clicked(mouseX, mouseY)
        if (flag) {
          this.onClick(mouseX, mouseY)
          return true
        }
      }
      return false
    } else return false
  }

  mouseReleased(mouseX, mouseY, button) {
    if (this.isValidClickButton(button)) {
      this.onRelease(mouseX, mouseY)
      return true
    } else return false
  }

  keyPressed(key) {
    return false
  }

  keyReleased(key) {
    return false
  }

  changeFocus(focus) {
    if (this.active && this.visible) {
      this.focused = !this.focused
      this.onFocusedChanged(this.focused)
      return this.focused
    } else return false
  }

  onFocusedChanged(focused) {
  }

  isMouseOver(mouseX, mouseY) {
    return this.active && this.visible && mouseX >= this.x && mouseY >= this.y && mouseX < (this.x + this.width) && mouseY < (this.y + this.height)
  }

  getIsHovered() {
    return this.isHovered || this.focused
  }

  isValidClickButton(button) {
    return button === 0
  }

  clicked(mouseX, mouseY) {
    return this.active && this.visible && mouseX >= this.x && mouseY >= this.y && mouseX < (this.x + this.width) && mouseY < (this.y + this.height)
  }
}
