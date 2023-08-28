//@ts-check
const { LitElement, html, css } = require('lit')
const { isMobile } = require('./components/common')
const { showModal, miscUiState } = require('../globalState')
const { options, watchValue } = require('../optionsStorage')
const { getGamemodeNumber } = require('../utils')

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
        touch-action: none;
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

      .mobile-top-btns {
        display: none;
        flex-direction: row;
        position: absolute;
        top: 0;
        left: 50%;
        transform: translate(-50%);
        gap: 0 1px;
        z-index: 20;
      }

      .pause-btn,
      .chat-btn {
        border: none;
        outline: none;
        width: 18px;
        height: 18px;
        background-image: url('extra-textures/gui.png');
        background-size: 256px;
        background-position-x: -200px;
        background-position-y: -64px;
      }

      .chat-btn {
        background-position-y: -82px;
      }
      .debug-btn {
        background: #9c8c86;
        font-size: 8px;
        /* todo make other buttons centered */
        margin-right: 5px;
      }

      .mobile-control-forward,
      .mobile-control-back,
      .mobile-control-left,
      .mobile-control-sneak,
      .mobile-control-jump,
      .mobile-control-right {
        position: absolute;
        width: 22px;
        height: 22px;
        background-image: url('extra-textures/gui.png');
        background-size: 256px;
        border: none;
        outline: none;
      }

      .mobile-control-forward:active,
      .mobile-control-back:active,
      .mobile-control-sneak:active,
      .mobile-control-left:active,
      .mobile-control-jump:active,
      .mobile-control-right:active {
        filter: brightness(85%);
      }

      .mobile-control-forward {
        top: 0;
        left: 50%;
        transform: translate(-50%);
        background-position: -2px -109px;
      }

      .mobile-control-back {
        bottom: 0;
        left: 50%;
        transform: translate(-50%);
        background-position: -54px -109px;
      }

      .mobile-control-left {
        top: 50%;
        left: 0;
        transform: translate(0, -50%);
        background-position: -28px -109px;
      }

      .mobile-control-right {
        top: 50%;
        right: 0;
        transform: translate(0, -50%);
        background-position: -80px -109px;
      }

      .mobile-control-jump {
        position: relative;
        width: 18px;
        height: 18px;
        background-position: -108px -111px;
      }

      .mobile-control-sneak {
        width: 18px;
        height: 18px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-position: -218px -82px;
      }
      .mobile-control-sneak.is-down {
        background-position: -218px -64px;
      }

      .mobile-controls-left {
        display: none;
        position: absolute;
        left: 8px;
        bottom: 0;
        width: 70px;
        height: 70px;
        z-index: 30;
        opacity: 0.65;
        transform-origin: bottom left;
        transform: scale(1.5);
      }

      .mobile-controls-right {
        display: none;
        flex-direction: column;
        place-items: center;
        place-content: center;
        position: absolute;
        right: 20px;
        bottom: 0;
        width: 22px;
        height: 70px;
        z-index: 30;
        opacity: 0.65;
        transform-origin: bottom right;
        transform: scale(1.5);
      }
    `
  }

  static get properties () {
    return {
      bot: { type: Object }
    }
  }

  /**
   * @param {import('mineflayer').Bot} bot
   */
  preload (bot) {
    const bossBars = this.shadowRoot.getElementById('bossbars-overlay')
    bossBars.bot = bot

    bossBars.init()
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

    this.bot = bot
    hotbar.bot = bot
    debugMenu.bot = bot

    if (bot._client) {
      hotbar.init()
      chat.init(bot._client)
      playerList.init(bot, host)
    }

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

    const onGameModeChange = () => {
      const gamemode = getGamemodeNumber(bot)
      healthbar.gameModeChanged(gamemode, bot.game.hardcore)
      foodbar.gameModeChanged(gamemode)
      // breathbar.gameModeChanged(gamemode)
      this.shadowRoot.querySelector('#xp-bar-bg').style.display = gamemode === 1 ? 'none' : 'block'
    }
    bot.on('game', onGameModeChange)
    onGameModeChange()

    const onHealthUpdate = () => {
      healthbar.updateHealth(bot.health, true)
      foodbar.updateHunger(bot.food, true)
    }
    bot.on('health', onHealthUpdate)
    onHealthUpdate()

    const onXpUpdate = () => {
      // @ts-ignore
      this.shadowRoot.querySelector('#xp-bar-bg').firstElementChild.style.width = `${182 * bot.experience.progress}px`
      xpLabel.innerHTML = String(bot.experience.level)
      xpLabel.style.display = bot.experience.level > 0 ? 'block' : 'none'
    }
    bot.on('experience', onXpUpdate)
    onXpUpdate()

    // bot.on('breath', () => {
    //   breathbar.updateOxygen(bot.oxygenLevel)
    // })

    // TODO
    // breathbar.updateOxygen(bot.oxygenLevel ?? 20)

    watchValue(options, (o) => {
      miscUiState.currentTouch = o.alwaysShowMobileControls || isMobile()
      this.showMobileControls(miscUiState.currentTouch)
    })
  }

  /** @param {boolean} bl */
  showMobileControls (bl) {
    this.shadowRoot.querySelector('#mobile-top').style.display = bl ? 'flex' : 'none'
    // this.shadowRoot.querySelector('#mobile-left').style.display = bl ? 'block' : 'none'
    // this.shadowRoot.querySelector('#mobile-right').style.display = bl ? 'flex' : 'none'
  }

  /**
   * @param {any} id
   * @param {boolean} action
   */
  mobileControl (e, id, action) {
    e.stopPropagation()
    this.bot.setControlState(id, action)
  }

  render () {
    return html`
      <div class="mobile-top-btns" id="mobile-top">
        <button class="debug-btn" @click=${(e) => {
        this.shadowRoot.getElementById('debug-overlay').showOverlay = !this.shadowRoot.getElementById('debug-overlay').showOverlay
      }}>F3</button>
        <button class="chat-btn" @click=${(e) => {
        e.stopPropagation()
        this.shadowRoot.querySelector('#chat').enableChat()
      }}></button>
        <button class="pause-btn" @click=${(e) => {
        e.stopPropagation()
        showModal(document.getElementById('pause-screen'))
      }}></button>
      </div>
      <!-- <div class="mobile-controls-left" id="mobile-left">
        <button
          class="mobile-control-forward"
          @pointerenter=${(e) => this.mobileControl(e, 'forward', true)}
          @pointerleave=${(e) => this.mobileControl(e, 'forward', false)}
          @mousedown=${(e) => this.mobileControl(e, 'forward', true)}
          @mouseup=${(e) => this.mobileControl(e, 'forward', false)}
        ></button>
        <button
          class="mobile-control-back"
          @pointerenter=${(e) => this.mobileControl(e, 'back', true)}
          @pointerleave=${(e) => this.mobileControl(e, 'back', false)}
          @mousedown=${(e) => this.mobileControl(e, 'back', true)}
          @mouseup=${(e) => this.mobileControl(e, 'back', false)}
        ></button>
        <button class="mobile-control-left"
          @pointerenter=${(e) => this.mobileControl(e, 'left', true)}
          @pointerleave=${(e) => this.mobileControl(e, 'left', false)}
          @mousedown=${(e) => this.mobileControl(e, 'left', true)}
          @mouseup=${(e) => this.mobileControl(e, 'left', false)}
        ></button>
        <button class="mobile-control-right"
          @pointerenter=${(e) => this.mobileControl(e, 'right', true)}
          @pointerleave=${(e) => this.mobileControl(e, 'right', false)}
          @mousedown=${(e) => this.mobileControl(e, 'right', true)}
          @mouseup=${(e) => this.mobileControl(e, 'right', false)}
        ></button>
        <button class="mobile-control-sneak" @dblclick=${(e) => {
        e.stopPropagation()
        const b = e.target.classList.toggle('is-down')
        this.bot.setControlState('sneak', b)
      }}></button>
      </div>
      <div class="mobile-controls-right" id="mobile-right">
        <button class="mobile-control-jump"
          @touchstart=${(e) => this.mobileControl(e, 'jump', true)}
          @touchend=${(e) => this.mobileControl(e, 'jump', false)}
          @mousedown=${(e) => this.mobileControl(e, 'jump', true)}
          @mouseup=${(e) => this.mobileControl(e, 'jump', false)}
        ></button>
      </div> -->

      <pmui-debug-overlay id="debug-overlay"></pmui-debug-overlay>
      <pmui-playerlist-overlay id="playerlist-overlay"></pmui-playerlist-overlay>
      <pmui-bossbars-overlay id="bossbars-overlay"></pmui-bossbars-overlay>
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
