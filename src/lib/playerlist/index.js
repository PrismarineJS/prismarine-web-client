const { LitElement, html, css } = require('lit-element')

class PlayerList extends LitElement {
  static get styles () {
    return css(require('./index.css'))
  }

  static get properties () {
    return {
      bot: { type: Object },
      clientId: { type: String },
      players: { type: Object }
    }
  }

  constructor () {
    super()
    this.clientId = ''
    this.players = {}
  }

  render () {
    return html`
      <div id="playerlist-container" class="playerlist-container" style="display: none;">
        ${Object.values(this.players).map(player => html`
          <div class="playerlist-entry${this.clientId === player.uuid ? ' plist-active-player' : ''}" id="plist-player-${player.uuid}">
            ${player.username}
            <div class="plist-ping-container">
              <p class="plist-ping-value">${player.ping}</p>
              <p class="plist-ping-label">ms</p>
            </div>
          </div>
        `)}
      </div>
    `
  }

  connectedCallback() {
    super.connectedCallback()
    const bot = this.bot

    const playerList = this.shadowRoot.querySelector('#playerlist-container')

    this.isOpen = false
    this.players = bot.players
    this.clientId = bot.player.uuid

    this.requestUpdate()

    const showList = (shouldShow = true) => {
      playerList.style.display = shouldShow ? 'block' : 'none'
      this.isOpen = shouldShow
    }

    document.addEventListener('keydown', e => {
      e ??= window.event
      if (e.key === 'Tab') {
        showList(true)
        e.preventDefault()
      }
    })

    document.addEventListener('keyup', e => {
      if (!this.isOpen) return
      e ??= window.event
      if (e.key === 'Tab') {
        showList(false)
        e.preventDefault()
      }
    })

    bot.on('playerUpdated', () => this.requestUpdate()) // LitElement seems to be batching requests, so it should be fine?
    bot.on('playerJoined', () => this.requestUpdate())
    bot.on('playerLeft', () => this.requestUpdate())
  }
}

window.customElements.define('player-list', PlayerList)
