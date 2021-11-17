const { LitElement, html, css } = require('lit')

class CrossHair extends LitElement {
  static get styles () {
    return css`
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
        height: calc(256px * 4);
        width: calc(256px * 4);
        transform: translate(calc(-50% + 120px * 4), calc(-50% + 120px * 4));
        clip-path: inset(0px calc(240px * 4) calc(240px * 4) 0px);
        z-index:10;
    }
    `
  }

  render () {
    return html`<img id="crosshair" src="extra-textures/icons.png">`
  }
}
window.customElements.define('cross-hair', CrossHair)
