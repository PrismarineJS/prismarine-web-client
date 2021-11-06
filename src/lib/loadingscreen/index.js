const { LitElement, html, css } = require('lit-element')

// eslint-disable-next-line promise/param-names
const timer = ms => new Promise(res => setTimeout(res, ms))
const array = ['.', '..', '...', '']

class LoadingScreen extends LitElement {
  constructor () {
    super()
    this.status = 'Waiting for JS load'
  }

  firstUpdated () {
    this.statusRunner()
  }

  static get properties () {
    return {
      status: { type: String },
      loadingText: { type: String }
    }
  }

  async statusRunner () {
    const load = async () => {
      for (let i = 0; true; i = ((i + 1) % array.length)) {
        this.loadingText = this.status + array[i]
        await timer(500)
      }
    }

    load()
  }

  static get styles () {
    return css(require('./index.css'))
  }

  render () {
    return html`
    <div id="loading-background" class="loader">
      <img src="extra-textures/loading.png" id="loading-image">
      <div id="loading" class="loader">
        <h1 class="middle" id="loading-text">${this.loadingText}</h1>
      </div>
    </div>
    `
  }
}

window.customElements.define('loading-screen', LoadingScreen)
