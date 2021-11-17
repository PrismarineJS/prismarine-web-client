const { LitElement, html, css } = require('lit')

export class LegacyButton extends LitElement {
  static get styles () {
    return css`
      :host {
        --guiScale: var(--guiScaleFactor, 3);
      }

      .legacy-btn {
        --textColor: white;
        image-rendering: crisp-edges;
        image-rendering: pixelated;
        text-decoration: none;
      
        cursor: default;
        border: none;
        background: none;
        outline: none;

        position: relative;
        z-index: 1;

        display: grid;
        width: 100%;
        height: calc(20px * var(--guiScale));

        font-family: mojangles, minecraft, monospace;
        font-size: calc(10px * var(--guiScale));

        align-items: center;
        justify-content: center;

        color: var(--textColor);
        text-shadow: calc(1px * var(--guiScale)) calc(1px * var(--guiScale)) black;
      }

      .legacy-btn:disabled {
        --textColor: rgb(160, 160, 160);
      }

      .legacy-btn::after,
      .legacy-btn::before {
        --yPos: -66px;
        content: '';
        display: block;

        position: absolute;
        top: 0;

        width: 50%;
        height: 100%;
        z-index: -1;

        background-image: url('textures/1.16.4/gui/widgets.png');
        background-size: calc(256px * var(--guiScale));
        background-position-y: calc(var(--yPos) * var(--guiScale));
      }

      .legacy-btn::after {
        left: 0;
      }

      .legacy-btn::before {
        left: 50%;
        background-position-x: calc(-200px * var(--guiScale) + 100%);
      }

      .legacy-btn:hover::after,
      .legacy-btn:hover::before,
      .legacy-btn:focus::after,
      .legacy-btn:focus::before {
        --yPos: -86px;
      }

      .legacy-btn:disabled::after,
      .legacy-btn:disabled::before {
        --yPos: -46px;
        --textColor: rgb(160, 160, 160);
      }
    `
  }

  static get properties () {
    return {
      size: {
        type: String,
        attribute: 'btn-width'
      },
      scaleFactor: {
        type: Number,
        attribute: 'scale-factor'
      }
    }
  }

  constructor () {
    super()
    this.scaleFactor = 3

    this.size = '100%'
    this.offset = [0, 0]
  }

  render () {
    return html`
      <button class="legacy-btn" style="width: calc(${this.size.endsWith('%') ? this.size : this.size + ' * var(--guiScale)'});"><slot></slot></button>
    `
  }
}

window.customElements.define('legacy-button', LegacyButton)
