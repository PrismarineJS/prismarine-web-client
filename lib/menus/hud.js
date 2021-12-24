const { LitElement, html, css } = require('lit')

class Hud extends LitElement {
  static get styles () {
    return css`
      :host {
        position: absolute;
        top: 0;
        left: 0;
        z-index: -2;
        width: 100%;
        height: 100%;
      }

      .crosshair {
        width: 16px;
        height: 16px;
        background: url('textures/1.17.1/gui/icons.png');
        background-size: 256px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
      }

      #xp-label {
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translate(-50%);
        font-size: 10px;
        font-family: minecraft, mojangles, monospace;
        color: rgb(30, 250, 30);
        text-shadow: 0px -1px #000, 0px 1px #000, 1px 0px #000, -1px 0px #000;
        z-index: 10;
      }

      #xp-bar-bg {
        position: absolute;
        left: 50%;
        bottom: 24px;
        transform: translate(-50%);
        width: 182px;
        height: 5px;
        background-image: url('textures/1.16.4/gui/icons.png');
        background-size: 256px;
        background-position-y: -64px;
      }

      .xp-bar {
        width: 182px;
        height: 5px;
        background-image: url('textures/1.17.1/gui/icons.png');
        background-size: 256px;
        background-position-y: -69px;
      }
    `
  }

  /**
   * @param {globalThis.THREE.Renderer} renderer
   * @param {import('mineflayer').Bot} bot
   * @param {string} host
   */
  init (renderer, bot, host) {
    const debugMenu = this.shadowRoot.querySelector('#debug-overlay')
    const playerList = this.shadowRoot.querySelector('#playerlist-overlay')
    const healthbar = this.shadowRoot.querySelector('#health-bar')
    const foodbar = this.shadowRoot.querySelector('#food-bar')
    // const breathbar = this.shadowRoot.querySelector('#breath-bar')
    const chat = this.shadowRoot.querySelector('#chat')
    const hotbar = this.shadowRoot.querySelector('#hotbar')
    const xpLabel = this.shadowRoot.querySelector('#xp-label')

    hotbar.bot = bot
    debugMenu.bot = bot

    chat.init(bot._client, renderer)
    playerList.init(bot, host)

    bot.on('entityHurt', (entity) => {
      if (entity !== bot.entity) return
      healthbar.onDamage()
    })

    bot.on('entityEffect', (entity, effect) => {
      if (entity !== bot.entity) return
      healthbar.effectAdded(effect)
    })

    bot.on('entityEffectEnd', (entity, effect) => {
      if (entity !== bot.entity) return
      healthbar.effectEnded(effect)
    })

    bot.on('game', () => {
      healthbar.gameModeChanged(bot.player.gamemode, bot.game.hardcore)
      foodbar.gameModeChanged(bot.player.gamemode)
      // breathbar.gameModeChanged(bot.player.gamemode)
      this.shadowRoot.querySelector('#xp-bar-bg').style.display = bot.player.gamemode === 1 ? 'none' : 'block'
    })

    bot.on('health', () => {
      healthbar.updateHealth(bot.health, true)
      foodbar.updateHunger(bot.food, true)
    })

    bot.on('experience', () => {
      this.shadowRoot.querySelector('#xp-bar-bg').firstElementChild.style.width = `${182 * bot.experience.progress}px`
      xpLabel.innerHTML = bot.experience.level
      xpLabel.style.display = bot.experience.level > 0 ? 'block' : 'none'
    })

    // bot.on('breath', () => {
    //   breathbar.updateOxygen(bot.oxygenLevel)
    // })

    this.shadowRoot.querySelector('#xp-bar-bg').style.display = bot.player.gamemode === 1 ? 'none' : 'block'
    this.shadowRoot.querySelector('#xp-bar-bg').firstElementChild.style.width = `${182 * bot.experience.progress}px`
    xpLabel.innerHTML = bot.experience.level
    xpLabel.style.display = bot.experience.level > 0 ? 'block' : 'none'
    healthbar.gameModeChanged(bot.player.gamemode, bot.game.hardcore)
    healthbar.updateHealth(bot.health)
    foodbar.updateHunger(bot.food)
    // breathbar.updateOxygen(bot.oxygenLevel ?? 20)
    hotbar.init()
  }

  render () {
    return html`
      <pmui-debug-overlay id="debug-overlay"></pmui-debug-overlay>
      <pmui-playerlist-overlay id="playerlist-overlay"></pmui-playerlist-overlay>
      <div class="crosshair"></div>
      <chat-box id="chat"></chat-box>
      <!--<pmui-breathbar id="breath-bar"></pmui-breathbar>-->
      <pmui-healthbar id="health-bar"></pmui-healthbar>
      <pmui-foodbar id="food-bar"></pmui-foodbar>
      <div id="xp-bar-bg">
        <div class="xp-bar"></div>
        <span id="xp-label"></span>
      </div>
      <pmui-hotbar id="hotbar"></pmui-hotbar>
    `
  }
}

window.customElements.define('pmui-hud', Hud)
