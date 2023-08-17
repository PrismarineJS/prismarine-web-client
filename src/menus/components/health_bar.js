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
  static get styles () {
    return css`
      .health {
        position: absolute;
        display: flex;
        flex-direction: row;
        left: calc(50% - 91px);
        bottom: 30px;
        --hardcore: 0;
        --kind: 0;
        --lightened: 0;
        --offset: calc(-1 * (52px + (9px * (4 * var(--kind) + var(--lightened) * 2)) ));
        --bg-x: calc(-1 * (16px + 9px * var(--lightened)));
        --bg-y: calc(-1 * var(--hardcore) * 45px);
      }

      .health.creative {
        display: none;
      }

      .health.hardcore {
        --hardcore: 1;
      }

      .health.poisoned {
        --kind: 1;
      }

      .health.withered {
        --kind: 2;
      }

      .health.absorption {
        --kind: 3;
      }

      .heart {
        width: 9px;
        height: 9px;
        background-image: url('textures/1.17.1/gui/icons.png'), url('textures/1.17.1/gui/icons.png');
        background-size: 256px, 256px;
        background-position: var(--bg-x) var(--bg-y), var(--bg-x) var(--bg-y);
        margin-left: -1px;
      }

      .heart.full {
         background-position: var(--offset) var(--bg-y), var(--bg-x) var(--bg-y);
      }

      .heart.half {
        background-position: calc(var(--offset) - 9px) var(--bg-y), var(--bg-x) var(--bg-y);
      }

      .health.low .heart {
        animation: lowHealthAnim 0.2s steps(2, end) infinite;
      }

      .health.low .heart:nth-of-type(2n) {
        animation-direction: reverse;
      }

      .health.low .heart:nth-of-type(3n) {
        animation-duration: 0.1s;
      }

      .health.damaged {
        animation: damagedAnim 0.3s steps(2, end) 2;
      }

      @keyframes lowHealthAnim {
        to {
          transform: translateY(1px);
        }
      }

      @keyframes damagedAnim {
        to { --lightened: 1; }
      }
    `
  }

  effectAdded (effect) {
    this.shadowRoot.querySelector('#health').classList.add(getEffectClass(effect))
  }

  effectEnded (effect) {
    this.shadowRoot.querySelector('#health').classList.remove(getEffectClass(effect))
  }

  onDamage () {
    this.shadowRoot.querySelector('#health').classList.toggle('damaged', true)
    if (this.hurtTimeout) clearTimeout(this.hurtTimeout)
    this.hurtTimeout = setTimeout(() => {
      this.shadowRoot.querySelector('#health').classList.toggle('damaged', false)
      this.hurtTimeout = null
    }, 1000)
  }

  gameModeChanged (gamemode, hardcore) {
    this.shadowRoot.querySelector('#health').classList.toggle('creative', gamemode === 1)
    this.shadowRoot.querySelector('#health').classList.toggle('hardcore', hardcore)
  }

  updateHealth (hValue, d) {
    const health = this.shadowRoot.querySelector('#health')
    health.classList.toggle('low', hValue <= 4)

    const hearts = health.children

    for (let i = 0; i < hearts.length; i++) {
      hearts[i].classList.remove('full')
      hearts[i].classList.remove('half')
    }

    if (d) this.onDamage()

    for (let i = 0; i < Math.ceil(hValue / 2); i++) {
      if (i >= hearts.length) break

      if (hValue % 2 !== 0 && Math.ceil(hValue / 2) === i + 1) {
        hearts[i].classList.add('half')
      } else {
        hearts[i].classList.add('full')
      }
    }
  }

  render () {
    return html`
      <div id="health" class="health">
        <div class="heart"></div>
        <div class="heart"></div>
        <div class="heart"></div>
        <div class="heart"></div>
        <div class="heart"></div>
        <div class="heart"></div>
        <div class="heart"></div>
        <div class="heart"></div>
        <div class="heart"></div>
        <div class="heart"></div>
      </div>
    `
  }
}

window.customElements.define('pmui-healthbar', HealthBar)
