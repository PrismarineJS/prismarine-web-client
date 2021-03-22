import { addPanorama, viewer } from "../../../..";
import Button from "../widgets/Button";
import GuiScreen from "./GuiScreen";
const config = require('../../../../config.json')
require('./../../../github_link')

export default class ConnectScreen extends GuiScreen {
  constructor(prevScreen) {
    super();

    this.prevScreen = prevScreen;

    /* this.server = config.defaultHost
    this.serverport = config.defaultHostPort ?? 25565
    this.proxy = config.defaultProxy
    this.proxyport = !config.defaultProxy && !config.defaultProxyPort ? '' : config.defaultProxyPort ?? 443
    this.username = window.localStorage.getItem('username') ?? 'pviewer' + (Math.floor(Math.random() * 1000))
    this.password = '' */
  }

  init() {
    this.addButton(new Button(this.width / 2 - 155, this.height - 29, 150, 20, 'Connect', () => {
      document.getElementById('prismarine-menu').shadowRoot.getElementById('play').click();
    }));

    this.addButton(new Button(this.width / 2 + 5, this.height - 29, 150, 20, 'Cancel', () => {
      addPanorama();
      document.getElementById('prismarine-menu').removeEventListener('connect', this.handleConnect);
      document.getElementById('prismarine-menu').style.display = 'none';
      this.mc.displayGuiScreen(this.prevScreen);
    }));

  }

  render(mouseX, mouseY) {
    this.renderBackground();
    super.render(mouseX, mouseY);
  }
} 