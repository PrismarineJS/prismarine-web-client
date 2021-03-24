import Context2D from "../../renderer/Context2D";
import Button from "../widgets/Button";
import { ConfirmScreen } from "./ConfirmScreen";

export class ConfirmOpenLinkScreen extends ConfirmScreen {
  constructor(callback, linkText, trusted) {
    super(callback, (trusted ? "Do you want to open this link or copy it to your clipboard?" : "Are you sure you want to open the following website?"), linkText);

    this.confirmButtonText = trusted ? 'Open' : 'Yes';
    this.cancelButtonText = trusted ? 'Cancel' : 'No';
    this.copyLinkButtonText = 'Copy to Clipboard';
    this.openLinkWarning = "Never open links from people that you don't trust!";
    this.showSecurityWarning = !trusted;
    this.linkText = linkText;
  }

  init() {
    this.addButton(new Button(this.width / 2 - 155, this.height / 6 + 96, 100, 20, this.confirmButtonText, (button) => {
      this.callbackFunction(true);
    }));
    this.addButton(new Button(this.width / 2 - 50, this.height / 6 + 96, 100, 20, this.copyLinkButtonText, (button) => {
      this.mc.keyboardListener.setClipboardString(this.linkText);
      this.callbackFunction(false);
    }));
    this.addButton(new Button(this.width / 2 + 55, this.height / 6 + 96, 100, 20, this.cancelButtonText, (button) => {
      this.callbackFunction(false);
    }));
  }

  render(mouseX, mouseY) {
    super.render(mouseX, mouseY);
    if(this.showSecurityWarning) {
      Context2D.drawCenteredText(this.openLinkWarning, this.width / 2, 110);
    }
  }
}
