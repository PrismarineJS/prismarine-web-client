const { LitElement, html, css } = require('lit-element')

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
    const array = ['.', '..', '...', '']
    // eslint-disable-next-line promise/param-names
    const timer = ms => new Promise(res => setTimeout(res, ms))

    const load = async () => {
      for (let i = 0; true; i = ((i + 1) % array.length)) {
        this.loadingText = this.status + array[i]
        await timer(500)
      }
    }

    load()
  }

  static get styles () {
    return css`
       @font-face {
            font-family: minecraft;
            src: url(minecraftia.woff);
        }

        @font-face {
            font-family: mojangles;
            src: url(mojangles.ttf);
        }

        h1 {
            font-family: mojangles, minecraft, monospace;
        }
        .loader {
            display: initial;
        }
        #loading-image {
            height: 75%;
            top: 50%;
            left: 50%;
            position: absolute;
            transform: translate(-50%, -50%);
            image-rendering: crisp-edges;
            image-rendering: -webkit-crisp-edges;
        }

        #loading-background {
            background-color: #60a490;
            z-index: 100;
            height: 100% !important;
            width: 100%;
            position: fixed;
        }

        #loading-text {
            color: #29594b;
            z-index: 200;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, 12rem);
        }
    `
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
