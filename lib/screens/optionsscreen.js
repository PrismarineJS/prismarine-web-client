const { LitElement, html, css } = require('lit-element')
require('../components/button')

class OptionsMenu extends LitElement {
  constructor () {
    super();
  }

  firstUpdated () {
    document.addEventListener('keydown', e => {
      e ??= window.event
      if (e.key === 'Escape') {
        this.closeScreen();
      }
    })
  }

  static get styles () {
    return css`
      .options-screen {
        --guiScale: 3;
        position: absolute;
        top: 0;
        left: 0;

        width: 100vw;
        height: 100vh;

        image-rendering: crisp-edges;
        image-rendering: pixelated;

        background: url('extra-textures/options_background.png') rgba(0, 0, 0, 0.75);
        background-size: calc(32px * var(--guiScale));
        background-blend-mode: multiply;
        z-index: 10;
      }

      .options-container {
        --guiScale: 3;
        position: absolute;
        top: calc(25% + calc((24px - 16px) * var(--guiScale)));
        left: 50%;

        transform: translate(-50%);

        width: max-content;
        height: max-content;
      }
    `;
  }

  render () {
    return html`
      <div class="options-screen">
        <div class="options-container">
          <legacy-button btn-width="200px" @click=${() => this.closeScreen()}>Done</legacy-button>
        </div>
      </div>
    `;
  }

  closeScreen() {
    this.style.display = 'none';
    document.getElementById('prismarine-menu').style.display = "block";
  }
}

window.customElements.define('options-menu', OptionsMenu)