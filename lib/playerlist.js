const { LitElement, html, css } = require('lit-element')

class PlayerList extends LitElement {
  static get styles () {
    return css`
        .playerlist-container {
          position: absolute;
          background-color: rgba(0, 0, 0, 0.5);
          left: 50%;
          top: 10%;
          transform: translateX(-50%);
          border: 2px solid rgba(0, 0, 0, 0.8);
          padding: 10px;
          min-width: 8%;
        }
        
        .playerlist-entry {
          overflow: hidden;
          color: white;
          font-size: 20px;
          margin: 0px;
          line-height: 100%;
          text-shadow: 2px 2px 0px #3f3f3f;
          font-family: mojangles, minecraft, monospace;
          width: 100%;
        }

        .plist-active-player {
          color: rgb(42, 204, 237);
        }
        
        .plist-ping-container {
          text-align: right;
          float: right;
          padding-left: 20px;
        }

        .plist-ping-value {
          color: rgb(114, 255, 114);
          float: left;
          margin: 0px;
        }

        .plist-ping-label {
          color: white;
          float: right;
          margin: 0px;
        }
    `
  }

  static get properties () {
    return {
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

  init (bot) {
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
