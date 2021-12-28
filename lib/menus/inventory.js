import { CanvasEventManager } from 'minecraft-inventory-gui'
import * as InventoryWindows from 'minecraft-inventory-gui'

import { getImage } from './utils/image-util.js'

import WindowManager from './utils/inv-manager-util.js'

const { LitElement, html, css } = require('lit')

class Inventory extends LitElement {
  static get styles () {
    return css`
      .bg {
        position: absolute;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.75);
        width: 100%;
        height: 100%;
      }

      .title {
        position: absolute;
        top: 40px;
        left: 50%;
        transform: translate(-50%);
        font-size: 10px;
        color: white;
        text-shadow: 1px 1px #222;
      }

      main {
        display: flex;
        flex-direction: column;
        gap: 4px 0;
        position: absolute;
        left: 50%;
        width: 204px;
        top: calc(25% + 48px - 16px);
        transform: translate(-50%);
      }

      .row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
      }
    `
  }

  constructor () {
    super()
    this.inMenu = false
  }

  init (renderer, bot) {
    const chat = document.getElementById('hud').shadowRoot.querySelector('#chat')
    const self = this

    document.addEventListener('keydown', e => {
      if (chat.inChat) return
      e = e || window.event
      if (e.keyCode === 69 || e.code === 'KeyE' || e.key === 'e') {
        if (self.inMenu) {
          self.disableGameMenu(renderer)
        } else {
          self.enableGameMenu()
        }
      }
    })

    const canvas = document.getElementById('inventory').shadowRoot.querySelector('#inventory-canvas')
    const canvasManager = new CanvasEventManager(canvas)
    canvasManager.setScale(4)

    const inventory = new InventoryWindows.PlayerWin(canvasManager, {
      getImage
    })

    window.inventory = inventory // expose it as a global for debugging

    setTimeout(() => {
      canvasManager.startRendering()
      console.log('Rendering!')
    }, 0)

    console.log('Initialising inventory!')

    new WindowManager(bot.inventory, inventory).initialRender()
  }

  render () {
    return html`
      <div class="bg"></div>

      <p class="title">Inventory</p>
    
      <main>
        <canvas id="inventory-canvas" width="1000" height="1000">Your browser doesn't support canvases we need them for pweb</canvas>
      </main>
    `
  }

  disableGameMenu (renderer = false) {
    this.inMenu = false
    this.style.display = 'none'
    if (renderer) {
      renderer.domElement.requestPointerLock()
    }
  }

  enableGameMenu () {
    this.inMenu = true
    document.exitPointerLock()
    this.style.display = 'block'
    this.focus()
  }

  onReturnPress (renderer = false) {
    this.inMenu = false
    this.style.display = 'none'
    if (renderer) {
      renderer.domElement.requestPointerLock()
    }
  }
}

window.customElements.define('pmui-inventory', Inventory)
