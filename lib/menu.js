const { LitElement, html, css } = require('lit-element')
require('./github_link')
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
      --guiScale: 3;
      position: absolute;
      top: 50%;
      left: 50%;
      width: calc(200px * var(--guiScale));
      padding: 0;
      transform: translate(-50%, -50%);
      box-sizing: border-box;
      border-radius: 10px;
    }
    
    form {
      display: flex;
      flex-direction: column
    }

    /* Button */
    .legacy-btn {
      --guiScale: 3;
      --textColor: white;
      image-rendering: crisp-edges;
      image-rendering: pixelated;
      text-decoration: none;
    
      cursor: default;
      border: none;
      background: none;
      outline: none;

      position: relative;
      z-index: 1;

      display: flex;
      width: 100%;
      height: calc(20px * var(--guiScale));

      font-family: mojangles, minecraft, monospace;
      font-size: calc(10px * var(--guiScale));

      align-items: center;
      justify-content: center;

      color: var(--textColor);
      text-shadow: calc(1px * var(--guiScale)) calc(1px * var(--guiScale)) black;
    }

    .legacy-btn:disabled {
      --textColor: rgb(160, 160, 160);
    }

    .legacy-btn::after,
    .legacy-btn::before {
      --yPos: -66px;
      content: '';
      display: block;

      position: absolute;
      top: 0;

      width: 50%;
      height: 100%;
      z-index: -1;

      background-image: url('../extra-textures/widgets.png');
      background-size: calc(256px * var(--guiScale));
      background-position-y: calc(var(--yPos) * var(--guiScale));
    }

    .legacy-btn::after {
      left: 0;
    }

    .legacy-btn::before {
      left: 50%;
      background-position-x: calc(-200px * var(--guiScale) + 100%);
    }

    .legacy-btn:hover::after,
    .legacy-btn:hover::before,
    .legacy-btn:focus::after,
    .legacy-btn:focus::before {
      --yPos: -86px;
    }

    .legacy-btn:disabled::after,
    .legacy-btn:disabled::before {
      --yPos: -46px;
      --textColor: rgb(160, 160, 160);
    }

    /* Text Field */
    .text-field-div {
      --guiScale: 3;
      --borderColor: grey;
      position: relative;

      width: calc(200px * var(--guiScale));
      height: calc(20px * var(--guiScale));

      background: black;
      border: calc(1px * var(--guiScale)) solid var(--borderColor);
    }

    .text-field-div:focus-within {
      --borderColor: white;
    }

    .text-field-div label {
      position: absolute;
      z-index: 2;
      pointer-events: none;
    
      bottom: calc(22px * var(--guiScale));
      left: 0;

      font-family: mojangles, minecraft, monospace;
      font-size: calc(10px * var(--guiScale));
    
      color: rgb(226, 226, 226);
      text-shadow: calc(1px * var(--guiScale)) calc(1px * var(--guiScale)) black;
    }

    .legacy-text-field {
      outline: none;
      border: none;
      background: none;

      position: relative;

      left: calc(2px * var(--guiScale));

      width: calc(100% - 4px * var(--guiScale));
      height: 100%;

      font-family: mojangles, minecraft, monospace;
      font-size: calc(10px * var(--guiScale));

      color: white;
      text-shadow: calc(1px * var(--guiScale)) calc(1px * var(--guiScale)) black;
    }

    .link-buttons {
      position: absolute;
      bottom: 0;
      left: 0;
    }

    .link-buttons .legacy-btn {
      width: calc(72px * var(--guiScale));
    }

    .title {
      text-align: center;

      font-family: mojangles, minecraft, monospace;
      font-size: calc(10px * var(--guiScale));
      font-weight: normal;

      color: white;
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
          <div class="text-field-div" style="width: 49%;">
            <label for="serverip">Server IP</label>
            <input id="serverip" type="text" name="" spellcheck="false" required="" value="${this.server}" @input=${e => { this.server = e.target.value }} class="legacy-text-field">
          </div>
          <div class="text-field-div" style="width: 49%;">
            <label for="port">Server Port</label>
            <input id="port" type="text" name="" spellcheck="false" required="" value="${this.serverport}" @input=${e => { this.serverport = e.target.value }} class="legacy-text-field">
          </div>
        </div>
        <br><br>
        <div class="wrapper">
          <div class="text-field-div">
            <label for="proxy">Proxy</label>
            <input id="proxy" type="text" name="" spellcheck="false" required="" value="${this.proxy}" @input=${e => { this.proxy = e.target.value }} class="legacy-text-field">
          </div>
          <div class="text-field-div">
            <label for="port">Port</label>
            <input id="port" type="text" name="" spellcheck="false" required="" value="${this.proxyport}" @input=${e => { this.proxyport = e.target.value }} class="legacy-text-field">
          </div>
        </div>
        <br><br>
        <div class="text-field-div">
          <label for="username">Username</label>
          <input id="username" type="text" name="" spellcheck="false" required="" value="${this.username}" @input=${e => { this.username = e.target.value }} class="legacy-text-field">
        </div>
        <br>
        <button class="legacy-btn" @click=${() => this.dispatchConnect()}>Play</button>
     </form>
    </div>

    <div class="link-buttons">
      <a class="legacy-btn" target=”_blank” href="https://github.com/PrismarineJS/prismarine-web-client">Github</a>
      <a class="legacy-btn" target=”_blank” href="https://discord.gg/4Ucm684Fq3">Discord</a>
    </div>
    `
  }
}

window.customElements.define('prismarine-menu', PrismarineMenu)
