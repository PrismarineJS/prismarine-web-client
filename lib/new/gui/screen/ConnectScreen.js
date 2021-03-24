import { addPanorama, viewer } from "../../../..";
import Button from "../widgets/Button";
import GuiScreen from "./GuiScreen";
const config = require('../../../../config.json')
require('./../../../github_link')

export default class ConnectScreen extends GuiScreen {
  constructor(prevScreen) {
    super();
    this.prevScreen = prevScreen;
  }

  init() {
    this.addButton(new Button(this.width / 2 - 155, this.height - 29, 150, 20, 'Connect', () => {
      document.getElementById('prismarine-menu').shadowRoot.getElementById('play').click();
    }));

    this.addButton(new Button(this.width / 2 + 5, this.height - 29, 150, 20, 'Cancel', () => {
      document.getElementById('prismarine-menu').removeEventListener('connect', this.handleConnect);
      document.getElementById('prismarine-menu').style.display = 'none';
      this.mc.displayGuiScreen(this.prevScreen);
    })).active = false;

  }

  render(mouseX, mouseY) {
    this.renderBackground();
    super.render(mouseX, mouseY);
  }
} 