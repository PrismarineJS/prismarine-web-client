const { LitElement, html, css } = require('lit-element')
require('./github_link')
require('./components/button')
require('./components/buttonlink')
require('./components/textfield')

class OptionsMenu extends LitElement {
  constructor () {
    super()
    this.inMenu = false
  }

  disableOptionsMenu () {
    this.inMenu = false
    this.style.display = 'none'
  }

  enableOptionsMenu () {
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

  setSens (num) {
    window.settings.mouseSens = num.replace(/[^\d.-]/g, '') / 100 * 0.005
  }

  render () {
    return html`
    <div class="menu-box">
      <h2 class="title">Options Menu</h2>
        <div class="spacev"></div>
        <legacy-button btn-width="100%" @click=${() => { this.disableOptionsMenu() }}>Back to Game Menu</legacy-button>
        <div class="spacev"></div>
        <h2 class="subtitle">Mouse Sensitivity</h2>
        <div class="wrapper">
          <legacy-button btn-width="100%">++</legacy-button>
          <legacy-text-field field-width="100%" field-id="sensitivity" field-value="${(window.settings.mouseSens * 100) / 0.005}%" @input=${e => { this.setSens(e.target.value) }}></legacy-text-field>
          <legacy-button btn-width="100%">--</legacy-button>
        </div>
    </div>
    `
  }

  init (renderer) {
    const chat = document.getElementById('chatbox')
    const self = this
    console.log('initialised options menu')

    document.addEventListener('keydown', e => {
      if (chat.inChat) return
      e = e || window.event
      if (e.key === 'z' || e.key === 'z') {
        console.log('toggling options menu')
        if (self.inMenu) {
          self.disableOptionsMenu(renderer)
        } else {
          self.enableOptionsMenu()
        }
      }
      if (e.keyCode === 27 || e.key === 'Escape' || e.key === 'Esc') {
        if (self.inMenu) self.disableOptionsMenu(renderer)
      }
    })
  }
}

window.customElements.define('options-menu', OptionsMenu)
