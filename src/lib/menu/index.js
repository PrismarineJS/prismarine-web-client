const { LitElement, html, css } = require('lit-element')
require('../../components/githublink')
require('../../components/button')
require('../../components/buttonlink')
require('../../components/textfield')

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
    return css(require('./index.css'))
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
