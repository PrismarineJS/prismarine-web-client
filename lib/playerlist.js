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

  render () {
    return html`
      <div id="playerlist-container" class="playerlist-container" style="display: none;">
      </div>
    `
  }

  init (bot) {
    const playerList = this.shadowRoot.querySelector('#playerlist-container')

    Object.values(bot.players).forEach(addPlayer)

    this.isOpen = false

    const showList = (shouldShow = true) => {
      playerList.style.display = shouldShow ? 'block' : 'none'
      this.isOpen = shouldShow
    }

    document.onkeydown = e => {
      e ??= window.event
      if (e.key === 'Tab') {
        showList(true)
        e.preventDefault()
      }
    }

    document.onkeyup = e => {
      if (!this.isOpen) return
      e ??= window.event
      if (e.key === 'Tab') {
        showList(false)
        e.preventDefault()
      }
    }

    function addPlayer (player) {
      const playerEntry = document.createElement('div') // There is likely a better way to handle this CSS-wise

      const playerPingContainer = document.createElement('div')
      const playerPingValue = document.createElement('p')
      const playerPingLabel = document.createElement('p')

      playerEntry.classList.add('playerlist-entry')
      playerEntry.innerHTML = player.username
      playerEntry.id = `plist-player-${player.uuid}`

      if (player.uuid === bot.player.uuid) {
        playerEntry.classList.add('plist-active-player')
      }

      playerPingContainer.classList.add('plist-ping-container')

      playerPingValue.classList.add('plist-ping-value')
      playerPingValue.innerHTML = player.ping

      playerPingLabel.classList.add('plist-ping-label')
      playerPingLabel.innerHTML = 'ms'

      playerPingContainer.appendChild(playerPingValue)
      playerPingContainer.appendChild(playerPingLabel)
      playerEntry.appendChild(playerPingContainer)
      playerList.appendChild(playerEntry)

      return playerEntry
    }

    function removePlayer (player) {
      playerList.querySelector(`#plist-player-${player.uuid}`)?.remove()
    }

    bot.on('playerUpdated', player => {
      let playerEntry = playerList.querySelector(`#plist-player-${player.uuid}`)

      if (!playerEntry) {
        playerEntry = addPlayer(player)
      }

      playerEntry.querySelector('.plist-ping-value').innerHTML = player.ping
    })

    bot.on('playerJoined', addPlayer)

    bot.on('playerLeft', removePlayer)
  }
}

window.customElements.define('player-list', PlayerList)
