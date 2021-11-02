const { LitElement, html, css } = require('lit-element')

function getEffectClass (effect) {
  switch (effect.id) {
    case 19: return 'poisoned'
    case 20: return 'withered'
    case 22: return 'absorption'
    default: return ''
  }
}

class HealthBar extends LitElement {
  static get properties() {
    return {
      health: { type: Number }
    }
  }

  constructor () {
    super()
    this.health = 20
  }

  connectedCallback() {
    super.connectedCallback()
    this.bot.on('entityHurt', (entity) => {
      if (entity !== this.bot.entity) return
      this.onDamage()
    })
    const healthMain = this.shadowRoot.firstElementChild
    this.bot.on('entityEffect', (entity, effect) => {
      if (entity !== this.bot.entity) return
      this.effect = getEffectClass(effect)
    })
    this.bot.on('entityEffectEnd', (entity, effect) => {
      if (entity !== this.bot.entity) return
      healthMain.classList.remove(getEffectClass(effect))
    })
    this.bot.on('game', () => this.onGameUpdate())
    this.bot.on('health', () => { this.health = this.bot.health })
    this.onGameUpdate()
    this.health = this.bot.health
  }

  onGameUpdate () {
    this.shadowRoot.firstElementChild.classList.toggle('creative', this.bot.player.gamemode === 1)
    this.shadowRoot.firstElementChild.classList.toggle('hardcore', this.bot.game.hardcore)
  }

  onDamage () {
    this.shadowRoot.firstElementChild.classList.add('damaged')
    if (this.hurtTimeout) clearTimeout(this.hurtTimeout)
    this.hurtTimeout = setTimeout(() => {
      this.shadowRoot.firstElementChild.classList.remove('damaged')
      this.hurtTimeout = null
    }, 1000)
  }

  static get properties () {
    return {
      bot: { type: Object }
    }
  }

  static get styles () {
    return css(require('./index.css'))
  }

  render () {
    return html`<div id="healthbar">
    <div class="health ${this.health <= 4 ? 'low' : ''}" data-value="${Math.min(this.health, 20)}">
      <p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p>
    </div>
    <div class="health absorption" data-value="${Math.max(this.bot.health - 20, 0)}">
      <p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p>
    </div>
  </div>`
  }
}
window.customElements.define('health-bar', HealthBar)
