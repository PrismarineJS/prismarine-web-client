const { LitElement, html, css } = require('lit-element')
require('./github_link')
require('./components/button')
require('./components/buttonlink')
require('./components/textfield')

class GameMenu extends LitElement {
  constructor () {
    super()
    this.inMenu = false
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

  static get styles () {
    return css`
    :host {
      --guiScale: var(--guiScaleFactor, 3);
    }

    html {
      height: 100%;
    }
    
    body {
      margin:0;
      padding:0;
      font-family: sans-serif;
      background: #000;
    }
    
    .menu-box {
      position: fixed;
      z-index: 11;
      top: 50%;
      left: 50%;
      width: calc(180px * var(--guiScale));
      padding: calc(10px * var(--guiScale));
      transform: translate(-50%, -50%);
      box-sizing: border-box;
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.8)
    }

    .link-buttons {
      display: flex;
      justify-content: space-between; 
      gap: calc(4px * var(--guiScale));
    }

    .title, .subtitle {
      text-align: center;

      font-family: mojangles, minecraft, monospace;
      font-size: calc(10px * var(--guiScale));
      font-weight: normal;

      color: white;
      margin-top: 0;
      text-shadow: calc(1px * var(--guiScale)) calc(1px * var(--guiScale)) black;
    }

    .subtitle {
      font-size: calc(7.5px * var(--guiScale));
    }

    .wrapper {
      display: flex;
      justify-content: space-between;   
      gap: calc(6px * var(--guiScale));
    }

    .spacev {
      height: calc(6px * var(--guiScale));
    }

    .field-spacev {
      height: calc(14px * var(--guiScale));
    }
    `
  }

  render () {
    return html`
    <github-link></github-link>
    <div class="menu-box">
      <h2 class="title">Game Menu</h2>
        <div class="spacev"></div>
        <legacy-button btn-width="100%" @click=${() => { this.disableGameMenu() }}>Back to Game</legacy-button>
        <div class="spacev"></div>
        <legacy-button btn-width="100%">Options</legacy-button>
        <div class="spacev"></div>
        <legacy-button btn-width="100%" onClick="window.location.reload();">Disconnect</legacy-button>
    </div>
    `
  }

  init (renderer) {
    const chat = document.getElementById('chatbox')
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
}

window.customElements.define('game-menu', GameMenu)
