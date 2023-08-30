//@ts-check
const { LitElement, html, css } = require('lit')
const { commonCss } = require('./components/common')
const { addPanoramaCubeMap } = require('../panorama')
const { hideModal, activeModalStacks, activeModalStack, replaceActiveModalStack, miscUiState } = require('../globalState')
const { guessProblem } = require('../guessProblem')
const { fsState } = require('../loadFolder')

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
      _loadingDots: { type: String },
      maybeRecoverable: { type: Boolean },
      hasError: { type: Boolean }
    }
  }

  constructor () {
    super()
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
    const timer = ms => new Promise((resolve) => setTimeout(resolve, ms))

    const load = async () => {
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

      <div class="title">${this.status}${this.hasError ? '' : this._loadingDots}<p class="potential-problem">${this.hasError ? guessProblem(this.status) : ''}</p></div>

      ${this.hasError
        ? html`<div class="error-buttons"><pmui-button .hidden=${!this.maybeRecoverable} pmui-width="200px" pmui-label="Back" @pmui-click=${() => {
          this.hasError = false
          if (activeModalStacks['main-menu']) {
            replaceActiveModalStack('main-menu')
          } else {
            hideModal(undefined, undefined, { force: true })
          }
          document.getElementById('play-screen').style.display = 'block'
          addPanoramaCubeMap()
        }}></pmui-button><pmui-button .hidden=${!(miscUiState.singleplayer && fsState.syncFs)} pmui-width="200px" pmui-label="Reset world" @pmui-click=${() => {
          if (!confirm('Are you sure you want to delete all local world content?')) return
          for (const key of Object.keys(localStorage)) {
            if (/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/g.test(key) || key === '/') {
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
