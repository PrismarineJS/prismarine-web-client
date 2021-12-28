const { LitElement, css, html } = require('lit')
const { repeat } = require('../../util')

class BreathBar extends LitElement {
  static get styles () {
    return css`
      .breathbar {
        position: absolute;
        display: flex;
        flex-direction: row-reverse;
        left: calc(50% + 91px);
        transform: translate(-100%);
        bottom: 40px;
        --offset: calc(-1 * 16px);
        --bg-x: calc(-1 * 16px);
        --bg-y: calc(-1 * 18px);
      }
      .breath {
        width: 9px;
        height: 9px;
        margin-left: -1px;
      }

      .breath.full {
        background-image: url('textures/1.17.1/gui/icons.png');
        background-size: 256px;
        background-position: var(--offset) var(--bg-y);
      }

      .breath.half {
        background-image: url('textures/1.17.1/gui/icons.png');
        background-size: 256px;
        background-position: calc(var(--offset) - 9) var(--bg-y);
      }
    `
  }

  static properties = {
    playerInCreative: { type: Boolean },
    breathBubbles: { type: Number },
    showBreathBubbles: { type: Boolean }
  }

  constructor() {
    super()
    this.showBreathBubbles = false
    this.breathBubbles = 20
    this.playerInCreative = false
  }

  init () {
    this.playerInCreative = bot.player.gamemode === 1
    this.breathBubbles = bot.oxygenLevel ?? 20
    this.showBreathBubbles = this.breathBubbles < 19
    bot.on('game', () => {
      this.playerInCreative = bot.player.gamemode === 1
    })
    bot.on('breath', () => {
      this.breathBubbles = bot.oxygenLevel ?? 20
      this.showBreathBubbles = this.breathBubbles < 20
      console.log('breathBubbles='+this.breathBubbles,'showBreathBubbles=',this.showBreathBubbles)
    })
  }

  /** @param {Number} ix index of bubble @returns {Boolean} */
  _showBubble (ix) {
    if (this.playerInCreative) {
      return false
    } else if (this.breathBubbles === 0) {
      return false
    }
    const hidden = ix % Math.ceil(this.breathBubbles / 2) <= 0
    return hidden
  }

  /** @param {Number} ix index of bubble @returns {'' | 'half' | 'full'} */
  _bubbleType (ix) {
    if (this.breathBubbles === 0) {
      return ''
    }

    const bubbles = this.breathBubbles / 2
    if (Math.ceil(bubbles) !== Math.floor(bubbles) && Math.ceil(bubbles) === ix) {
      return 'half'
    } else if (Math.floor(bubbles) >= ix) {
      return 'full'
    }

    return ''
  }

  render () {
    return html`
    <div id="breathbar" class="breathbar">
      ${repeat(10, ix => html`<div ?hidden=${this._showBubble(ix)} class=${this._bubbleType(ix)}></div>`, 1)}
    </div>
    `
  }
}

window.customElements.define('pmui-breathbar', BreathBar)
