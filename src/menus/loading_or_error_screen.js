//@ts-check
const { LitElement, html, css } = require('lit')
const { addPanoramaCubeMap } = require('../panorama')
const { hideModal, activeModalStacks, activeModalStack, replaceActiveModalStack, miscUiState } = require('../globalState')
const { guessProblem } = require('../guessProblem')
const { fsState } = require('../loadSave')
const { commonCss } = require('./components/common')

class LoadingErrorScreen extends LitElement {
  static get styles () {
    return css`
      ${commonCss}
      .title {
        top: 30px;
      }

      .potential-problem {
        color: #808080;
      }
      .last-status {
        color: #808080;
      }

      .error-buttons {
        position: absolute;
        top: calc(20% + 60px);
        left: 50%;
        transform: translate(-50%);
        display: flex;
        flex-direction: column;
      }
    `
  }

  static get properties () {
    return {
      status: { type: String },
      lastStatus: { type: String },
      _loadingDots: { type: String },
      maybeRecoverable: { type: Boolean },
      hasError: { type: Boolean }
    }
  }

  constructor () {
    super()
    this.lastStatus = ''
    this.hideDots = false
    this.hasError = false
    this.maybeRecoverable = true
    this.status = 'Waiting for JS load'
    this._loadingDots = ''
  }

  firstUpdated () {
    this.statusRunner()
  }

  async statusRunner () {
    const array = ['.', '..', '...', '']
    const timer = async ms => new Promise((resolve) => {setTimeout(resolve, ms)})

    const load = async () => {
      // eslint-disable-next-line no-constant-condition
      for (let i = 0; true; i = ((i + 1) % array.length)) {
        this._loadingDots = array[i]
        await timer(500)
      }
    }

    load()
  }

  hide () {
    // cancel hiding
    return true
  }

  render () {
    return html`
      <div class="dirt-bg"></div>

      <div class="title" data-test-id="loading-or-error-message">${this.status}${this.hasError || this.hideDots ? '' : this._loadingDots}
      <p class="potential-problem">${this.hasError ? guessProblem(this.status) : ''}</p>
      <p class="last-status">${this.lastStatus ? `Last status: ${this.lastStatus}` : this.lastStatus}</p></div>

      ${this.hasError
      ? html`<div class="error-buttons"><pmui-button .hidden=${!this.maybeRecoverable} pmui-width="200px" pmui-label="Back" @pmui-click=${() => {
        this.hasError = false
        this.lastStatus = ''
        miscUiState.gameLoaded = false
        if (activeModalStacks['main-menu']) {
          replaceActiveModalStack('main-menu')
        } else {
          hideModal(undefined, undefined, { force: true })
        }
        document.getElementById('play-screen').style.display = 'block'
        addPanoramaCubeMap()
      }}></pmui-button><pmui-button .hidden=${!(miscUiState.singleplayer && fsState.inMemorySave)} pmui-width="200px" pmui-label="Reset world" @pmui-click=${() => {
        if (!confirm('Are you sure you want to delete all local world content?')) return
        for (const key of Object.keys(localStorage)) {
          if (/^[\da-fA-F]{8}(?:\b-[\da-fA-F]{4}){3}\b-[\da-fA-F]{12}$/g.test(key) || key === '/') {
            localStorage.removeItem(key)
          }
        }
        window.location.reload()
      }}></pmui-button><pmui-button @pmui-click=${() => window.location.reload()} pmui-label="Full Reload" pmui-width="200px"></pmui-button></div>`
      : ''
      }
    `
  }
}

window.customElements.define('pmui-loading-error-screen', LoadingErrorScreen)
