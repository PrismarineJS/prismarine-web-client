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
      background: linear-gradient(#141e30, #243b55);
    }
    
    .login-box {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 400px;
      padding: 40px;
      transform: translate(-50%, -50%);
      background: rgba(.1,.1,.2,.7);
      box-sizing: border-box;
      box-shadow: 0 15px 25px rgba(0,0,0,.6);
      border-radius: 10px;
    }
    
    .login-box h2 {
      margin: 0 0 30px;
      padding: 0;
      color: #fff;
      text-align: center;
    }
    
    .login-box .user-box,
    .login-box .port-box,
    .login-box .ip-box{
      position: relative;
    }
    
    .login-box .user-box input,
    .login-box .port-box input,
    .login-box .ip-box input{
      padding: 10px 0;
      font-size: 16px;
      color: #fff;
      margin-bottom: 30px;
      border: none;
      border-bottom: 1px solid #fff;
      outline: none;
      background: transparent;
    }
    
    .login-box .user-box input{
      width: 100%
    }
    
    .login-box .port-box input {
      width: 15%
    }
    
    .login-box .user-box label,
    .login-box .port-box label,
    .login-box .ip-box label{
      position: absolute;
      top:0;
      left: 0;
      padding: 10px 0;
      font-size: 16px;
      color: #fff;
      pointer-events: none;
      transition: .5s;
    }
    
    .login-box .user-box input:focus ~ label,
    .login-box .user-box input:valid ~ label,
    .login-box .port-box input:focus ~ label,
    .login-box .port-box input:valid ~ label,
    .login-box .ip-box input:focus ~ label,
    .login-box .ip-box input:valid ~ label{
      top: -20px;
      left: 0;
      color: #03e9f4;
      font-size: 12px;
    }
    
    .login-box form a#play {
      position: relative;
      display: inline-block;
      padding: 10px 20px;
      color: #03e9f4;
      font-size: 16px;
      text-decoration: none;
      text-transform: uppercase;
      overflow: hidden;
      transition: .5s;
      margin-top: 40px;
      letter-spacing: 4px
    }
    
    .login-box a#play:hover {
      background: #03e9f4;
      color: #fff;
      border-radius: 5px;
      box-shadow: 0 0 5px #03e9f4,
                  0 0 25px #03e9f4,
                  0 0 50px #03e9f4,
                  0 0 100px #03e9f4;
    }
    
    .login-box a#play span {
      position: absolute;
      display: block;
    }
    
    .login-box a#play span:nth-child(1) {
      top: 0;
      left: -100%;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent, #03e9f4);
      animation: btn-anim1 1s linear infinite;
    }
    
    @keyframes btn-anim1 {
      0% {
        left: -100%;
      }
      50%,100% {
        left: 100%;
      }
    }
    
    .login-box a#play span:nth-child(2) {
      top: -100%;
      right: 0;
      width: 2px;
      height: 100%;
      background: linear-gradient(180deg, transparent, #03e9f4);
      animation: btn-anim2 1s linear infinite;
      animation-delay: .25s
    }
    
    @keyframes btn-anim2 {
      0% {
        top: -100%;
      }
      50%,100% {
        top: 100%;
      }
    }
    
    .login-box a#play span:nth-child(3) {
      bottom: 0;
      right: -100%;
      width: 100%;
      height: 2px;
      background: linear-gradient(270deg, transparent, #03e9f4);
      animation: btn-anim3 1s linear infinite;
      animation-delay: .5s
    }
    
    @keyframes btn-anim3 {
      0% {
        right: -100%;
      }
      50%,100% {
        right: 100%;
      }
    }
    
    .login-box a#play span:nth-child(4) {
      bottom: -100%;
      left: 0;
      width: 2px;
      height: 100%;
      background: linear-gradient(360deg, transparent, #03e9f4);
      animation: btn-anim4 1s linear infinite;
      animation-delay: .75s
    }
    
    @keyframes btn-anim4 {
      0% {
        bottom: -100%;
      }
      50%,100% {
        bottom: 100%;
      }
    }
    form {
      display: flex;
     flex-direction: column
    }
    .ip-with-port {
      display: flex;
      justify-content: space-between;
       
      gap: 10px
    }
    
    a#play {
      width: max-content;
    }
    #port {
      width: 100%;
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
      <h2>Prismarine Web Client</h2>
      <h3 style="color:gray">A minecraft client in the browser!</h3>
      <p style="color:gray">Want to contribute?
      Look at our <a style="color:gray" target=”_blank” href="https://github.com/PrismarineJS/prismarine-web-client">github</a>
      and join our <a style="color:gray" target=”_blank” href="https://discord.gg/4Ucm684Fq3">discord</a><p><br>
      <form>
        <div class="ip-with-port">
        <div class="ip-box">
          <input id="serverip" type="text" name="" required="" value="${this.server}" @input=${e => { this.server = e.target.value }}>
          <label>Server</label>
        </div>
        <div class="port-box">
          <input id="port" type="text" name="" required="" value="${this.serverport}" @input=${e => { this.serverport = e.target.value }}>
          <label>Port</label>
        </div>
            </div>
        <form>
          <div class="ip-with-port">
        <div class="ip-box">
          <input id="proxy" type="text" name="" required="" value="${this.proxy}" @input=${e => { this.proxy = e.target.value }}>
          <label>Proxy</label>
        </div>
        <div class="port-box">
          <input id="port" type="text" name="" required="" value="${this.proxyport}" @input=${e => { this.proxyport = e.target.value }}>
          <label>Port</label>
        </div>
            </div>
        <form>
        <div class="user-box">
          <input id="username" type="text" name="" required="" value="${this.username}" @input=${e => { this.username = e.target.value }}>
          <label>Username</label>
        </div>
        <a id="play" href="#" @click=${() => this.dispatchConnect()}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          Play
        </a>
     </form>
    </div>
    `
  }
}

window.customElements.define('prismarine-menu', PrismarineMenu)
