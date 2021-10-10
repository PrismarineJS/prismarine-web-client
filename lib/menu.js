const { LitElement, html, css } = require('lit-element')
require('./github_link')
require('./components/button')
require('./components/buttonlink')
require('./components/textfield')

/* global fetch */
class PrismarineMenu extends LitElement {
  constructor () {
    super()
    [
      this.server = '',
      this.serverport = 25565,
      this.proxy = '',
      this.proxyport = ''
    ] = (window.localStorage.getItem('connection') ?? '').split(':')
    this.username = window.localStorage.getItem('username') ?? ''
    this.password = ''
    fetch('config.json').then(res => res.json()).then(config => {
      this.defaultConfig = config
      this.applyDefaultConfig()
    })
  }
  
  applyDefaultConfig () {
    this.username ||= 'pviewer' + (Math.floor(Math.random() * 10000))
    const { defaultHost, defaultHostPort = 25565, defaultProxy, defaultProxyPort } = this.defaultConfig
    this.server ||= defaultHost
    this.serverport ||= defaultHostPort
    this.proxy ||= defaultProxy
    this.proxyport ||= !(defaultProxy || defaultProxyPort) ? '' : (defaultProxyPort ?? 443)
  }
  diffDefaultConfig () {
    return [
      this.server !== this.defaultConfig.defaultHost ? this.server : '',
      this.serverport !== this.defaultConfig.defaultHostPort ? this.serverport : '',
      this.proxy !== this.defaultConfig.defaultProxy ? this.proxy : '',
      this.proxyport !== this.defaultConfig.defaultProxyPort ? this.proxyport : ''
    ]
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
      width: calc(180px * var(--guiScale));
      padding: calc(10px * var(--guiScale));
      transform: translate(-50%, -50%);
      box-sizing: border-box;
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.5)
    }
    
    form {
      display: flex;
      margin-left: 0;
      margin-right: 0;
      padding-left: 0;
      padding-right: 0;
      flex-direction: column
    }

    .bottom-links {
      margin-top: calc(6px * var(--guiScale));
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .bottom-links span {
      text-align: center;
      color: rgb(175, 175, 175);
      padding: calc(1px * var(--guiScale));
      font-family: mojangles, minecraft, monospace;
      font-size: calc(10px * var(--guiScale));
      text-shadow: calc(1px * var(--guiScale)) calc(1px * var(--guiScale)) black;
    }

    .link-buttons {
      display: flex;
      justify-content: space-between; 
      gap: calc(4px * var(--guiScale));
    }

    .title, .subtitle {
      text-align: center;

      font-family: mojangles, minecraft, monospace;
      font-size: calc(10px * var(--guiScale));
      font-weight: normal;

      color: white;
      margin-top: 0;
      text-shadow: calc(1px * var(--guiScale)) calc(1px * var(--guiScale)) black;
    }

    .subtitle {
      font-size: calc(7.5px * var(--guiScale));
    }

    .wrapper {
      display: flex;
      justify-content: space-between;   
      gap: calc(6px * var(--guiScale));
    }

    .spacev {
      height: calc(6px * var(--guiScale));
    }

    .field-spacev {
      height: calc(14px * var(--guiScale));
    }
    `
  }

  dispatchConnect () {
    this.applyDefaultConfig()
    window.localStorage.setItem('connection', this.diffDefaultConfig().join(':'))
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
      <h3 class="subtitle" style="color: rgb(175, 175, 175)">A minecraft client in the browser!</h3>
      <form>
        <div class="field-spacev"></div>
        <div class="wrapper">
          <legacy-text-field field-width="100%" field-label="Server IP" field-id="serverip" field-value="${this.server}" @input=${e => { this.server = e.target.value }}></legacy-text-field>
          <legacy-text-field field-width="100%" field-label="Server Port" field-id="port" field-value="${this.serverport}" @input=${e => { this.serverport = e.target.value }}></legacy-text-field>
        </div>
        <div class="field-spacev"></div>
        <div class="wrapper">
          <legacy-text-field field-width="100%" field-label="Proxy" field-id="proxy" field-value="${this.proxy}" @input=${e => { this.proxy = e.target.value }}></legacy-text-field>
          <legacy-text-field field-width="100%" field-label="Port" field-id="port" field-value="${this.proxyport}" @input=${e => { this.proxyport = e.target.value }}></legacy-text-field>
        </div>
        <div class="field-spacev"></div>
        <legacy-text-field field-width="100%" field-label="Username" field-id="username" field-value="${this.username}" @input=${e => { this.username = e.target.value }}></legacy-text-field>
        <div class="spacev"></div>
        <legacy-button btn-width="100%" @click=${() => { this.dispatchConnect() }}>Play</legacy-button>
        <div class="bottom-links">
          <span> Want to contribute?</span>
          <div class="link-buttons"> 
            <legacy-button-link btn-width="78px" go-to="https://github.com/PrismarineJS/prismarine-web-client">Github</legacy-button-link>
            <legacy-button-link btn-width="78px" go-to="https://discord.gg/4Ucm684Fq3">Discord</legacy-button-link>
          </div>
        </div>
      </form>
    </div>
    `
  }
}

window.customElements.define('prismarine-menu', PrismarineMenu)
