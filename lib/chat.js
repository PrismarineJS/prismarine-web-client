const { LitElement, html, css } = require('lit')
const { isMobile } = require('./menus/components/common')

const styles = {
  black: 'color:#000000',
  dark_blue: 'color:#0000AA',
  dark_green: 'color:#00AA00',
  dark_aqua: 'color:#00AAAA',
  dark_red: 'color:#AA0000',
  dark_purple: 'color:#AA00AA',
  gold: 'color:#FFAA00',
  gray: 'color:#AAAAAA',
  dark_gray: 'color:#555555',
  blue: 'color:#5555FF',
  green: 'color:#55FF55',
  aqua: 'color:#55FFFF',
  red: 'color:#FF5555',
  light_purple: 'color:#FF55FF',
  yellow: 'color:#FFFF55',
  white: 'color:#FFFFFF',
  bold: 'font-weight:900',
  strikethrough: 'text-decoration:line-through',
  underlined: 'text-decoration:underline',
  italic: 'font-style:italic'
}

function colorShadow (hex, dim = 0.25) {
  const color = parseInt(hex.replace('#', ''), 16)

  const r = (color >> 16 & 0xFF) * dim | 0
  const g = (color >> 8 & 0xFF) * dim | 0
  const b = (color & 0xFF) * dim | 0

  const f = (c) => ('00' + c.toString(16)).substr(-2)
  return `#${f(r)}${f(g)}${f(b)}`
}

class ChatBox extends LitElement {
  static get styles () {
    return css`
        .chat-wrapper {
            position: fixed;
            z-index: 10;
        }

        .chat-display-wrapper {
            bottom: 40px;
            padding: 4px;
            padding-left: 0;
            max-height: var(--chatHeight);
            width: var(--chatWidth);
            transform-origin: bottom left;
            transform: scale(var(--chatScale));
        }

        .chat-input-wrapper {
            bottom: 1px;
            width: calc(100% - 3px);
            position: absolute;
            left: 1px;
            box-sizing: border-box;
            overflow: hidden;
            background-color: rgba(0, 0, 0, 0);
        }

        .input-mobile {
          top: 1px;
        }

        .display-mobile {
          top: 40px;
        }

        .chat {
            overflow: hidden;
            color: white;
            font-size: 10px;
            margin: 0px;
            line-height: 100%;
            text-shadow: 1px 1px 0px #3f3f3f;
            font-family: mojangles, minecraft, monospace;
            width: 100%;
            max-height: var(--chatHeight);
        }

        input[type=text], #chatinput {
            background-color: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(0, 0, 0, 0);
            display: none;
            outline: none;
        }

        #chatinput:focus {
          border-color: white;
        }
        
        .chat-message {
            display: block;
            padding-left: 4px;
            background-color: rgba(0, 0, 0, 0.5);
        }

        .chat-message-fadeout {
            opacity: 1;
            transition: all 3s;
        }

        .chat-message-fade {
            opacity: 0;
        }

        .chat-message-faded {
            transition: none !important;
        }

        .chat-message-chat-opened {
            opacity: 1 !important;
            transition: none !important;
        }
    `
  }

  render () {
    return html`
    <div id="chat-wrapper" class="chat-wrapper chat-display-wrapper">
      <div class="chat" id="chat">
        <li class="chat-message chat-message-fade chat-message-faded">Welcome to prismarine-web-client! Chat appears here.</li>
      </div>
    </div>
    <div id="chat-wrapper2" class="chat-wrapper chat-input-wrapper">
      <div class="chat" id="chat-input">
        <input type="text" class="chat" id="chatinput" spellcheck="false" autocomplete="off"></input>
      </div>
    </div>
    `
  }

  constructor () {
    super()
    this.chatHistoryPos = 0
    this.chatHistory = []
  }

  enableChat (isCommand) {
    const chat = this.shadowRoot.querySelector('#chat')
    const chatInput = this.shadowRoot.querySelector('#chatinput')

    this.shadowRoot.querySelector('#chat-wrapper2').classList.toggle('input-mobile', isMobile())
    this.shadowRoot.querySelector('#chat-wrapper').classList.toggle('display-mobile', isMobile())

    // Set inChat value
    this.inChat = true
    // Exit the pointer lock
    document.exitPointerLock()
    // Show chat input
    chatInput.style.display = 'block'
    // Show extended chat history
    chat.style.maxHeight = 'var(--chatHeight)'
    chat.scrollTop = chat.scrollHeight // Stay bottom of the list
    if (isCommand) { // handle commands
      chatInput.value = '/'
    }
    // Focus element
    chatInput.focus()
    this.chatHistoryPos = this.chatHistory.length
    document.querySelector('#hud').shadowRoot.querySelector('#chat').shadowRoot.querySelectorAll('.chat-message').forEach(e => e.classList.add('chat-message-chat-opened'))
  }

  /**
   * @param {globalThis.THREE.Renderer} client
   * @param {import('minecraft-protocol').Client} renderer
   */
  init (client, renderer) {
    this.inChat = false
    const chat = this.shadowRoot.querySelector('#chat')
    const gameMenu = document.getElementById('pause-screen')
    const chatInput = this.shadowRoot.querySelector('#chatinput')

    renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock ||
            renderer.domElement.mozRequestPointerLock ||
            renderer.domElement.webkitRequestPointerLock

    // Show chat
    chat.style.display = 'block'

    // Esc event - Doesnt work with onkeypress?! - keypressed is deprecated uk
    document.addEventListener('keydown', e => {
      if (gameMenu.inMenu) return
      if (!this.inChat) return
      e = e || window.event
      if (e.code === 'Escape') {
        disableChat()
      } else if (e.code === 'ArrowUp') {
        if (this.chatHistoryPos === 0) return
        chatInput.value = this.chatHistory[--this.chatHistoryPos] !== undefined ? this.chatHistory[this.chatHistoryPos] : ''
        setTimeout(() => { chatInput.setSelectionRange(-1, -1) }, 0)
      } else if (e.code === 'ArrowDown') {
        if (this.chatHistoryPos === this.chatHistory.length) return
        chatInput.value = this.chatHistory[++this.chatHistoryPos] !== undefined ? this.chatHistory[this.chatHistoryPos] : ''
        setTimeout(() => { chatInput.setSelectionRange(-1, -1) }, 0)
      }
    })

    const keyBindScrn = document.getElementById('keybinds-screen')

    // Chat events
    document.addEventListener('keypress', e => {
      if (gameMenu.inMenu) return
      e = e || window.event
      if (this.inChat === false) {
        keyBindScrn.keymaps.forEach(km => {
          if (e.code === km.key) {
            switch (km.defaultKey) {
              case 'KeyT':
                setTimeout(() => this.enableChat(false), 0)
                break
              case 'Slash':
                setTimeout(() => this.enableChat(true), 0)
                break
            }
          }
        })

        return false
      }

      if (!this.inChat) return

      e.stopPropagation()

      if (e.code === 'Enter') {
        this.chatHistory.push(chatInput.value)
        client.write('chat', { message: chatInput.value })
        disableChat()
      }
    })

    const disableChat = () => {
      this.inChat = false
      hideChat()
      renderer.domElement.requestPointerLock()
    }

    const hideChat = () => {
      // Clear chat input
      chatInput.value = ''
      // Unfocus it
      chatInput.blur()
      // Hide it
      chatInput.style.display = 'none'
      // Hide extended chat history
      chat.style.maxHeight = 'var(--chatHeight)'
      chat.scrollTop = chat.scrollHeight // Stay bottom of the list
      document.querySelector('#hud').shadowRoot.querySelector('#chat').shadowRoot.querySelectorAll('.chat-message').forEach(e => e.classList.remove('chat-message-chat-opened'))
    }

    client.on('chat', (packet) => {
      // Reading of chat message
      const fullmessage = JSON.parse(packet.message.toString())
      const msglist = []

      const colorF = (color) => {
        return color.trim().startsWith('#') ? `color:${color}` : styles[color] ?? undefined
      }

      const readMsg = (msglist, msg) => {
        const styles = {
          color: msg.color,
          bold: !!msg.bold,
          italic: !!msg.italic,
          underlined: !!msg.underlined,
          strikethrough: !!msg.strikethrough,
          obfuscated: !!msg.obfuscated
        }

        if (msg.text) {
          msglist.push({
            text: msg.text,
            ...styles
          })
        }

        if (msg.translate) {
          const tText = window.mcData.language[msg.translate] ?? msg.translate

          if (msg.with) {
            const splited = tText.split(/%s|%\d+\$s/g)

            let i = 0
            splited.forEach((spl, j, arr) => {
              msglist.push({ text: spl, ...styles })

              if (j + 1 < arr.length) {
                if (msg.with[i]) {
                  if (typeof msg.with[i] === 'string') {
                    readMsg(msglist, {
                      ...styles,
                      text: msg.with[i]
                    })
                  } else {
                    readMsg(msglist, {
                      ...styles,
                      ...msg.with[i]
                    })
                  }
                }
                i++
              }
            })
          } else {
            msglist.push({
              text: tText,
              ...styles
            })
          }
        }

        if (msg.extra) {
          msg.extra.forEach(ex => {
            readMsg(msglist, { ...styles, ...ex })
          })
        }
      }

      readMsg(msglist, fullmessage)

      const li = document.createElement('li')
      msglist.forEach(msg => {
        const span = document.createElement('span')
        span.appendChild(document.createTextNode(msg.text))
        span.setAttribute(
          'style',
                `${msg.color ? colorF(msg.color.toLowerCase()) + `; text-shadow: 1px 1px 0px ${colorShadow(colorF(msg.color.toLowerCase()).replace('color:', ''))}` : styles.white}; ${
                msg.bold ? styles.bold + ';' : ''
                }${msg.italic ? styles.italic + ';' : ''}${
                msg.strikethrough ? styles.strikethrough + ';' : ''
                }${msg.underlined ? styles.underlined + ';' : ''}`
        )
        li.appendChild(span)
      })
      chat.appendChild(li)
      chat.scrollTop = chat.scrollHeight // Stay bottom of the list
      // fading
      li.classList.add('chat-message')
      if (this.inChat) {
        li.classList.add('chat-message-chat-opened')
      }
      setTimeout(() => {
        li.classList.add('chat-message-fadeout')
        li.classList.add('chat-message-fade')
        setTimeout(() => {
          li.classList.add('chat-message-faded')
        }, 3000)
      }, 5000)
    })

    hideChat()
  }
}

window.customElements.define('chat-box', ChatBox)
