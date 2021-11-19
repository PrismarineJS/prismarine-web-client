const { html } = require('lit')
const { LegacyButton } = require('./button')

class LegacyButtonLink extends LegacyButton {
  constructor () {
    super()
    this.href = ''
  }

  static get properties () {
    return {
      size: {
        type: String,
        attribute: 'btn-width'
      },
      href: {
        type: String,
        attribute: 'go-to'
      }
    }
  }

  render () {
    return html`
      <a class="legacy-btn" href=${this.href} target="_blank" style="width: calc(${this.size} * var(--guiScale));"><slot></slot></a>
    `
  }
}

window.customElements.define('legacy-button-link', LegacyButtonLink)
