const { LitElement, html, css } = require('lit')

function getEffectClass (effect) {
  switch (effect.id) {
    case 19: return 'poisoned'
    case 20: return 'withered'
    case 22: return 'absorption'
    default: return ''
  }
}

class HealthBar extends LitElement {
  updated (changedProperties) {
    if (changedProperties.has('bot')) {
      this.bot.once('spawn', () => this.init())
    }
  }

  init () {
    this.bot.on('entityHurt', (entity) => {
      if (entity !== this.bot.entity) return
      this.onDamage()
    })
    this.bot.on('entityEffect', (entity, effect) => {
      if (entity !== this.bot.entity) return
      this.shadowRoot.firstElementChild.classList.add(getEffectClass(effect))
    })
    this.bot.on('entityEffectEnd', (entity, effect) => {
      if (entity !== this.bot.entity) return
      this.shadowRoot.firstElementChild.classList.remove(getEffectClass(effect))
    })
    this.bot.on('game', () => this.onGameUpdate())
    this.bot.on('health', () => this.updateHealth())
    this.onGameUpdate()
    this.updateHealth()
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

  updateHealth () {
    const wrapper = this.shadowRoot.firstElementChild
    const health = wrapper.firstElementChild
    const absorption = wrapper.lastElementChild
    health.dataset.value = Math.min(this.bot.health, 20)
    absorption.dataset.value = Math.max(this.bot.health - 20, 0)
    health.classList.toggle('low', this.bot.health <= 4)
  }

  static get properties () {
    return {
      bot: { type: Object }
    }
  }

  static get styles () {
    return css`
#healthbar {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translate(calc(-182px * 2), calc(-22px * 7));
  display: flex;
  flex-direction: column-reverse;
  --lightened: 0;
  --hardcore: 0;
  --kind: 1;
  --background-x: calc(-3 * (16px + var(--lightened) * 9px));
  --background-y: calc(-3 * (var(--hardcore) * 5 * 9px));
  --offset: calc(-3 * (16px + 9px * (var(--kind) * 4 + var(--lightened) * 2)));
  --health: attr(data-value number);
}
#healthbar.creative { display: none; }
#healthbar.hardcore { --hardcore: 1; }
#healthbar.poisoned { --kind: 2; }
#healthbar.withered { --kind: 3; }
.health.absorption { --kind: 4; }
.health.absorption > * { visibility: hidden; }

.health > * , .food > * {
  display: inline-block;
  image-rendering: optimizeSpeed;
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: -o-crisp-edges;
  image-rendering: pixelated;
  -ms-interpolation-mode: nearest-neighbor;
  width: calc(3 * 9px);
  height: calc(3 * 9px);
  margin: 0;
  margin-right: -3px;
  background-image: url(extra-textures/icons.png), url(extra-textures/icons.png);
  background-repeat: no-repeat, no-repeat;
  background-size: calc(3 * 256px) auto, calc(3 * 256px) auto;
  background-position: var(--background-x) var(--background-y), var(--background-x) var(--background-y);
}

/* Damage flashing animation */
.health.damaged {
  animation: damaged 0.3s steps(2, end) 2;
}
@media (prefers-reduced-motion) {
  .health.damaged {
    animation: none;
    --lightened: 1;
  }
}
@keyframes damaged {
  to { --lightened: 1; }
}

/* Low health shaking animation */
.health.low > * {
  animation: lowhealth 0.2s steps(2, end) infinite;
}
.health.low > *:nth-child(2n) {
  animation-direction: reverse;
}
.health.low > *:nth-child(3n) {
  animation-duration: 0.1s;
}
@media (prefers-reduced-motion) {
  .health.low > * {
    animation-duration: 0.5s !important;
  }
}
@keyframes lowhealth {
  to {
    transform: translateY(3px);
  }
}


/* 1 - 2-20 */
.health[data-value*="2"] > :nth-child(1),
.health[data-value*="3"] > :nth-child(1),
.health[data-value*="4"] > :nth-child(1),
.health[data-value*="5"] > :nth-child(1),
.health[data-value*="6"] > :nth-child(1),
.health[data-value*="7"] > :nth-child(1),
.health[data-value*="8"] > :nth-child(1),
.health[data-value*="9"] > :nth-child(1),
.health[data-value^="1"]:not([data-value="1"]) > :nth-child(1),
/* 2 - 4-20 */
.health[data-value*="4"] > :nth-child(2),
.health[data-value*="5"] > :nth-child(2),
.health[data-value*="6"] > :nth-child(2),
.health[data-value*="7"] > :nth-child(2),
.health[data-value*="8"] > :nth-child(2),
.health[data-value*="9"] > :nth-child(2),
.health[data-value^="1"]:not([data-value="1"]) > :nth-child(2),
.health[data-value="20"] > :nth-child(2),
/* 3 - 6-20 */
.health[data-value*="6"] > :nth-child(3),
.health[data-value*="7"] > :nth-child(3),
.health[data-value*="8"] > :nth-child(3),
.health[data-value*="9"] > :nth-child(3),
.health[data-value^="1"]:not([data-value="1"]) > :nth-child(3),
.health[data-value="20"] > :nth-child(3),
/* 4 - 8-20 */
.health[data-value*="8"] > :nth-child(4),
.health[data-value*="9"] > :nth-child(4),
.health[data-value^="1"]:not([data-value="1"]) > :nth-child(4),
.health[data-value="20"] > :nth-child(4),
/* 5 - 10-20 */
.health[data-value^="1"]:not([data-value="1"]) > :nth-child(5),
.health[data-value="20"] > :nth-child(5),
/* 6 - 12-20 */
.health[data-value^="1"]:not([data-value$="1"]):not([data-value$="0"]) > :nth-child(6),
.health[data-value="20"] > :nth-child(6),
/* 7 - 14-20 */
.health[data-value^="1"]:not([data-value$="0"]):not([data-value$="1"]):not([data-value$="2"]):not([data-value$="3"]) > :nth-child(7),
.health[data-value="20"] > :nth-child(7),
/* 8 - 16-20 */
.health[data-value="16"] > :nth-child(8),
.health[data-value="17"] > :nth-child(8),
.health[data-value="18"] > :nth-child(8),
.health[data-value="19"] > :nth-child(8),
.health[data-value="20"] > :nth-child(8),
/* 9 - 18-20 */
.health[data-value="18"] > :nth-child(9),
.health[data-value="19"] > :nth-child(9),
.health[data-value="20"] > :nth-child(9),
/* 10 - 20 */
.health[data-value="20"] > :nth-child(10),
.health > .full {
  visibility: visible;
  background-position: var(--offset) var(--background-y), var(--background-x) var(--background-y);
}
.health[data-value="1"] > :nth-child(1),
.health[data-value="3"] > :nth-child(2),
.health[data-value="5"] > :nth-child(3),
.health[data-value="7"] > :nth-child(4),
.health[data-value="9"] > :nth-child(5),
.health[data-value="11"] > :nth-child(6),
.health[data-value="13"] > :nth-child(7),
.health[data-value="15"] > :nth-child(8),
.health[data-value="17"] > :nth-child(9),
.health[data-value="19"] > :nth-child(10),
.health > .half {
  visibility: visible;
  background-position: calc((-3 * 9px) + var(--offset)) var(--background-y), var(--background-x) var(--background-y);
}`
  }

  render () {
    return html`<div id="healthbar">
  <div class="health" data-value="20"><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p></div>
  <div class="health absorption" data-value="0"><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p></div>
</div>`
  }
}
window.customElements.define('health-bar', HealthBar)
