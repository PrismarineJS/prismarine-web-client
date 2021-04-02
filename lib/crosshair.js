const { LitElement, html, css } = require('lit-element')

class CrossHair extends LitElement {
  static get styles () {
    return css`
    :host {
      --guiScale: var(--guiScaleFactor, 3);
    }

    #crosshair {
        image-rendering: optimizeSpeed;
        image-rendering: -moz-crisp-edges;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: -o-crisp-edges;
        image-rendering: pixelated;
        -ms-interpolation-mode: nearest-neighbor;
        position: absolute;
        top: 50%;
        left: 50%;
        height: calc(16px * var(--guiScale));
        width: calc(16px * var(--guiScale));
        transform: translate(-50%, -50%);
        background-image: url('/extra-textures/icons.png');
        background-size: calc(256px * var(--guiScale));
        z-index: 10;
    }
    `
  }

  render () {
    return html`<div id="crosshair"></div>`
  }
}
window.customElements.define('cross-hair', CrossHair)
