import { getMCInstance } from "../../../..";
import MathHelper from "../../utils/MathHelper";
import Widget, { WIDGETS_LOCATION } from "./Widget";

export default class AbstractSlider extends Widget {
  constructor(x, y, width, height, message, defaultValue) {
    super(x, y, width, height, message);
    this.sliderValue = defaultValue;
  }

   getYImage(isHovered) {
     return 0;
   }

  renderBg(minecraft, mouseX, mouseY) {
    let i = (this.getIsHovered() ? 2 : 1) * 20;
    minecraft.textureManager.bindImage(WIDGETS_LOCATION);
    this.blit(this.x + (this.sliderValue * (this.width - 8)), this.y, 0, 46 + i, 4, 20);
    this.blit(this.x + (this.sliderValue * (this.width - 8)) + 4, this.y, 196, 46 + i, 4, 20);
  }

  onClick(mouseX, mouseY) {
    this.changeSliderValue(mouseX);
  }

  keyPressed(key) {
    if(this.focused) {
      let isLeftArrow = key == 'ArrowLeft';
      if (isLeftArrow || key == 'ArrowRight') {
        let f = isLeftArrow ? -1.0 : 1.0;
        this.setSliderValue(this.sliderValue + (f / (this.width - 8)));
      }
    }
    return false;
  }

  changeSliderValue(mouseX) {
    this.setSliderValue((mouseX - (this.x + 4)) / (this.width - 8));
  }

  setSliderValue(value) {
    let decimalValue = this.sliderValue;
    this.sliderValue = MathHelper.clamp(value, 0.0, 1.0);
    if (decimalValue != this.sliderValue) this.setSaveOptionValue();

    this.setName();
  }

  onDrag(mouseX, mouseY, dragX, dragY) {
    this.changeSliderValue(mouseX);
    super.onDrag(mouseX, mouseY, dragX, dragY);
  }

  playDownSound() {
  }

  onRelease(mouseX, mouseY) {
  }

  setName() {
  }

  setSaveOptionValue() {
  }
}