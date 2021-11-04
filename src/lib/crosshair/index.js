const { LitElement, html, css } = require('lit-element')

class CrossHair extends LitElement {
  static get styles () {
    return css(require('./index.css'))
  }

  render () {
    return html`<img id="crosshair" src="extra-textures/icons.png">`
  }
}
window.customElements.define('cross-hair', CrossHair)
