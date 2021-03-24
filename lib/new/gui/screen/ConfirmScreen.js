import Context2D from "../../renderer/Context2D";
import Button from "../widgets/Button";
import GuiScreen from "./GuiScreen";

export class ConfirmScreen extends GuiScreen {
  constructor(callback, title, msgLine2, confirmBtnText = 'Yes', cancelBtnText = 'No') {
    super();
    this.title = title;
    this.ticksUntilEnable = 0;
    this.callbackFunction = callback;
    this.messageLine2 = msgLine2;
    this.confirmButtonText = confirmBtnText;
    this.cancelButtonText = cancelBtnText;
  }

  init() {
    this.addButton(new Button(this.width / 2 - 155, this.height / 6 + 96, 150, 20, this.confirmButtonText, () => {
      this.callbackFunction(true);
    }));
    this.addButton(new Button(this.width / 2 - 155 + 160, this.height / 6 + 96, 150, 20, this.cancelButtonText, () => {
      this.callbackFunction(false);
    }));
  }

  render(mouseX, mouseY) {
    this.renderBackground();
    Context2D.drawCenteredText(this.title, this.width / 2, 70);
    Context2D.drawCenteredText(this.messageLine2, this.width / 2, 90);
    super.render(mouseX, mouseY);
  }

  shouldCloseOnEsc() {
    return false;
  }

  keyPressed(key) {
    if(key == 'Escape') {
      this.callbackFunction(false);
      return true;
    } else return super.keyPressed(key);
  }
}