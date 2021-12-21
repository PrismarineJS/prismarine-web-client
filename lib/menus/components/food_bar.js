const { LitElement, html, css } = require('lit')

class FoodBar extends LitElement {
  static get styles () {
    return css`
      .foodbar {
        position: absolute;
        display: flex;
        flex-direction: row-reverse;
        left: calc(50% + 91px);
        transform: translate(-100%);
        bottom: 30px;
        --lightened: 0;
        --offset: calc(-1 * (52px));
        --bg-x: calc(-1 * (16px + 9px * var(--lightened)));
        --bg-y: calc(-1 * 27px);
      }

      .food {
        width: 9px;
        height: 9px;
        background-image: url('textures/1.17.1/gui/icons.png'), url('textures/1.17.1/gui/icons.png');
        background-size: 256px, 256px;
        background-position: var(--bg-x) var(--bg-y), var(--bg-x) var(--bg-y);
        margin-left: -1px;
      }

      .food.full {
        background-position: var(--offset) var(--bg-y), var(--bg-x) var(--bg-y);
      }

      .food.half {
        background-position: calc(var(--offset) - 9px) var(--bg-y), var(--bg-x) var(--bg-y);
      }

      .foodbar.low .food {
        animation: lowHungerAnim 0.2s steps(2, end) infinite;
      }

      .foodbar.low .food:nth-of-type(2n) {
        animation-direction: reverse;
      }

      .foodbar.low .food:nth-of-type(3n) {
        animation-duration: 0.1s;
      }

      .foodbar.updated {
        animation: updatedAnim 0.3s steps(2, end) 2;
      }

      @keyframes lowHungerAnim {
        to { transform: translateY(1px); }
      }

      @keyframes updatedAnim {
        to { --lightened: 1; }
      }
    `
  }

  gameModeChanged (gamemode) {
    this.shadowRoot.querySelector('#foodbar').classList.toggle('creative', gamemode === 1)
  }

  onHungerUpdate () {
    this.shadowRoot.querySelector('#foodbar').classList.toggle('updated', true)
    if (this.hungerTimeout) clearTimeout(this.hungerTimeout)
    this.hungerTimeout = setTimeout(() => {
      this.shadowRoot.querySelector('#foodbar').classList.toggle('updated', false)
      this.hungerTimeout = null
    }, 1000)
  }

  updateHunger (hValue, d) {
    const foodbar = this.shadowRoot.querySelector('#foodbar')
    foodbar.classList.toggle('low', hValue <= 5)

    const foods = foodbar.children

    for (let i = 0; i < foods.length; i++) {
      foods[i].classList.remove('full')
      foods[i].classList.remove('half')
    }

    // if (d) this.onHungerUpdate()

    for (let i = 0; i < Math.ceil(hValue / 2); i++) {
      if (i >= foods.length) break

      if (hValue % 2 !== 0 && Math.ceil(hValue / 2) === i + 1) {
        foods[i].classList.add('half')
      } else {
        foods[i].classList.add('full')
      }
    }
  }

  render () {
    return html`
      <div id="foodbar" class="foodbar" data-value="4">
        <div class="food"></div>
        <div class="food"></div>
        <div class="food"></div>
        <div class="food"></div>
        <div class="food"></div>
        <div class="food"></div>
        <div class="food"></div>
        <div class="food"></div>
        <div class="food"></div>
        <div class="food"></div>
      </div>
    `
  }
}

window.customElements.define('pmui-foodbar', FoodBar)
