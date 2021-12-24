const { LitElement, html, css } = require('lit')
const { openURL, displayScreen } = require('./components/common')

class PauseScreen extends LitElement {
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

  init (renderer) {
    const chat = document.getElementById('hud').shadowRoot.querySelector('#chat')
    const self = this

    document.addEventListener('keydown', e => {
      if (chat.inChat) return
      e = e || window.event
      if (e.keyCode === 27 || e.key === 'Escape' || e.key === 'Esc') {
        if (self.inMenu) {
          self.disableGameMenu(renderer)
        } else {
          self.enableGameMenu()
        }
      }
    })
  }

  render () {
    return html`
      <div class="bg"></div>

      <p class="title">Game Menu</p>
    
      <main>
        <pmui-button pmui-width="204px" pmui-label="Back to Game" @pmui-click=${this.onReturnPress}></pmui-button>
        <div class="row">
          <pmui-button pmui-width="98px" pmui-label="Github" @pmui-click=${() => openURL('https://github.com/PrismarineJS/prismarine-web-client')}></pmui-button>
          <pmui-button pmui-width="98px" pmui-label="Discord" @pmui-click=${() => openURL('https://discord.gg/4Ucm684Fq3')}></pmui-button>
        </div>
        <pmui-button pmui-width="204px" pmui-label="Options" @pmui-click=${() => displayScreen(this, document.getElementById('options-screen'))}></pmui-button>
        <pmui-button pmui-width="204px" pmui-label="Disconnect" @pmui-click=${() => window.location.reload()}></pmui-button>
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

window.customElements.define('pmui-pausescreen', PauseScreen)
