const { LitElement, html, css } = require('lit-element')
require('./github_link')
require('./components/button')
require('./components/buttonlink')
require('./components/textfield')

/* global fetch */
class PrismarineMenu extends LitElement {
  constructor () {
    super()

    this.server = ''
    this.serverport = 25565
    this.proxy = ''
    this.proxyport = ''
    this.username = window.localStorage.getItem('username') ?? 'pviewer' + (Math.floor(Math.random() * 1000))
    this.password = ''
    fetch('config.json').then(res => res.json()).then(config => {
      this.server = config.defaultHost
      this.serverport = config.defaultHostPort ?? 25565
      this.proxy = config.defaultProxy
      this.proxyport = !config.defaultProxy && !config.defaultProxyPort ? '' : config.defaultProxyPort ?? 443
    })
  }

  static get properties () {
    return {
      server: { type: String },
      serverport: { type: Number },
      proxy: { type: String },
      proxyport: { type: Number },
      username: { type: String },
      password: { type: String }
    }
  }

  static get styles () {
    return css`
    :host {
      --guiScale: var(--guiScaleFactor, 3);
    }

    html {
      height: 100%;
    }
    
    body {
      margin:0;
      padding:0;
      font-family: sans-serif;
      background: #000;
    }
    
    .login-box {
      position: absolute;
      top: 50%;
      left: 50%;
      width: calc(200px * var(--guiScale));
      padding: calc(10px * var(--guiScale));
      transform: translate(-50%, -50%);
      box-sizing: border-box;
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.5)
    }
    
    form {
      display: flex;
      flex-direction: column
    }

    .link-buttons {
      position: absolute;
      bottom: 0;
      left: 0;
    }

    .title {
      text-align: center;

      font-family: mojangles, minecraft, monospace;
      font-size: calc(10px * var(--guiScale));
      font-weight: normal;

      color: white;
      margin-top: 0;
      text-shadow: calc(1px * var(--guiScale)) calc(1px * var(--guiScale)) black;
    }

    .wrapper {
      display: flex;
      justify-content: space-between;
       
      gap: 10px;
    }
    `
  }

  dispatchConnect () {
    window.localStorage.setItem('username', this.username)
    this.dispatchEvent(new window.CustomEvent('connect', {
      detail: {
        server: `${this.server}:${this.serverport}`,
        proxy: `${this.proxy}${this.proxy !== '' ? `:${this.proxyport}` : ''}`,
        username: this.username,
        password: this.password
      }
    }))
  }

  render () {
    return html`
    <github-link></github-link>
    <div class="login-box">
      <h2 class="title">Prismarine Web Client</h2>
      <br><br>
      <form>
        <div class="wrapper">
          <legacy-text-field field-width="100%" field-label="Server IP" field-id="serverip" field-value="${this.server}" @input=${e => { this.server = e.target.value }}></legacy-text-field>
          <legacy-text-field field-width="100%" field-label="Server Port" field-id="port" field-value="${this.serverport}" @input=${e => { this.serverport = e.target.value }}></legacy-text-field>
        </div>
        <br><br>
        <div class="wrapper">
          <legacy-text-field field-width="100%" field-label="Proxy" field-id="proxy" field-value="${this.proxy}" @input=${e => { this.proxy = e.target.value }}></legacy-text-field>
          <legacy-text-field field-width="100%" field-label="Port" field-id="port" field-value="${this.proxyport}" @input=${e => { this.proxyport = e.target.value }}></legacy-text-field>
        </div>
        <br><br>
        <legacy-text-field field-width="100%" field-label="Username" field-id="username" field-value="${this.username}" @input=${e => { this.username = e.target.value }}></legacy-text-field>
        <br>
        <legacy-button btn-width="100%" @click=${() => { this.dispatchConnect() }}>Play</legacy-button>
     </form>
    </div>

    <div class="link-buttons">
      <legacy-button-link btn-width="72px" go-to="https://github.com/PrismarineJS/prismarine-web-client">Github</legacy-button-link>
      <legacy-button-link btn-width="72px" go-to="https://discord.gg/4Ucm684Fq3">Discord</legacy-button-link>
    </div>
    `
  }
}

window.customElements.define('prismarine-menu', PrismarineMenu)
