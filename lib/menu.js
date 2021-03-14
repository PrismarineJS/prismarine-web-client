const { LitElement, html, css } = require('lit-element')
const config = require('../config.json')

class PrismarineMenu extends LitElement {
  constructor () {
    super()

    this.server = config.defaultHost
    this.proxy = config.defaultProxy
    this.username = window.localStorage.getItem('username') ?? 'pviewer' + (Math.floor(Math.random() * 1000))
    this.password = ''
  }

  static get properties () {
    return {
      server: { type: String },
      proxy: { type: String },
      username: { type: String },
      password: { type: String }
    }
  }

  static get styles () {
    return css`
        label {
            grid-column: labels;
            grid-row: auto;
        }
        
        input,
        button {
            grid-column: controls;
            grid-row: auto;
            border: none;
            padding: 1em;
        }
        div {
            display: grid;
            grid-template-columns: [labels] auto [controls] 1fr;
            grid-auto-flow: row;
            grid-gap: .8em;
            background: #eee;
            padding: 1.2em;
        }
      `
  }

  dispatchConnect () {
    window.localStorage.setItem('username', this.username)
    this.dispatchEvent(new window.CustomEvent('connect', {
      detail: {
        server: this.server,
        proxy: this.proxy,
        username: this.username,
        password: this.password
      }
    }))
  }

  render () {
    return html`
    Welcome to Prismarine Web Client!
    <div>
        <label for="server">Server</label>
        <input id="server" type="text" value="${this.server}" @input=${e => { this.server = e.target.value }}>

        <label for="proxy">Proxy</label>
        <input id="proxy" type="text" value="${this.proxy}" @input=${e => { this.proxy = e.target.value }}>

        <label for="username">Username</label>
        <input id="username" type="text" value="${this.username}" @input=${e => { this.username = e.target.value }}>

        <label for="password">Password</label>
        <input id="password" type="text" value="${this.password}" @input=${e => { this.paswword = e.target.value }}>
    
    
        <button style="font-size:2em" @click=${() => this.dispatchConnect()}>Play</button>
    </div>
    `
  }
}

window.customElements.define('prismarine-menu', PrismarineMenu)
