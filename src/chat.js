//@ts-check
const { LitElement, html, css } = require('lit')
const { isMobile } = require('./menus/components/common')
const { activeModalStack, hideCurrentModal, showModal, miscUiState } = require('./globalState')
import { repeat } from 'lit/directives/repeat.js'
import { classMap } from 'lit/directives/class-map.js'
import { isCypress } from './utils'

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

/**
 * @typedef {{text;color?;italic?;underlined?;strikethrough?;bold?}} MessagePart
 * @typedef {{parts: MessagePart[], id, fading?, faded}} Message
 */

class ChatBox extends LitElement {
  static get styles () {
    return css`
        .chat-wrapper {
            position: fixed;
            z-index: 10;
        }

        .chat-messages-wrapper {
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
            pointer-events: none;
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
            pointer-events: none;
        }
        .chat.opened {
            pointer-events: auto;
        }

        input[type=text], #chatinput {
            background-color: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(0, 0, 0, 0);
            display: none;
            outline: none;
            pointer-events: auto;
        }

        #chatinput:focus {
          border-color: white;
        }

        .chat-message {
            display: flex;
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

        .chat.opened .chat-message {
            opacity: 1 !important;
            transition: none !important;
        }

        .chat-message-part {
            white-space: pre-wrap;
        }
    `
  }

  static get properties () {
    return {
      messages: {
        type: Array
      }
    }
  }

  constructor () {
    super()
    this.chatHistoryPos = 0
    this.chatHistory = JSON.parse(window.sessionStorage.chatHistory || '[]')
    this.messagesLimit = 200
    /** @type {Message[]} */
    this.messages = [{
      parts: [
        {
          text: 'Welcome to prismarine-web-client! Chat appears here.',
        }
      ],
      id: 0,
      fading: true,
      faded: true,
    }]
  }

  enableChat (initialText = '') {
    if (this.inChat) {
      hideCurrentModal()
      return
    }

    const chat = this.shadowRoot.getElementById('chat-messages')
    /** @type {HTMLInputElement} */
    // @ts-ignore
    const chatInput = this.shadowRoot.getElementById('chatinput')

    showModal(this)

    // Exit the pointer lock
    document.exitPointerLock?.()
    // Show chat input
    chatInput.style.display = 'block'
    // Show extended chat history
    chat.style.maxHeight = 'var(--chatHeight)'
    chat.scrollTop = chat.scrollHeight // Stay bottom of the list
    // handle / and other snippets
    chatInput.value = initialText
    // Focus element
    chatInput.focus()
    this.chatHistoryPos = this.chatHistory.length
    // to show
    this.requestUpdate()
  }

  get inChat () {
    return activeModalStack.find(m => m.elem === this) !== undefined
  }

  /**
   * @param {import('minecraft-protocol').Client} client
   */
  init (client) {
    const chat = this.shadowRoot.getElementById('chat-messages')
    /** @type {HTMLInputElement} */
    // @ts-ignore
    const chatInput = this.shadowRoot.getElementById('chatinput')

    // Show chat
    chat.style.display = 'block'

    // Chat events
    document.addEventListener('keydown', e => {
      if (activeModalStack.slice(-1)[0]?.elem !== this) return
      if (e.code === 'ArrowUp') {
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

    document.addEventListener('keypress', e => {
      if (!this.inChat && activeModalStack.length === 0) {
        keyBindScrn.keymaps.forEach(km => {
          if (e.code === km.key) {
            switch (km.defaultKey) {
              case 'KeyT':
                setTimeout(() => this.enableChat(), 0)
                break
              case 'Slash':
                setTimeout(() => this.enableChat('/'), 0)
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
        window.sessionStorage.chatHistory = JSON.stringify(this.chatHistory)
        client.write('chat', { message: chatInput.value })
        hideCurrentModal()
      }
    })

    this.hide = () => {
      // Clear chat input
      chatInput.value = ''
      // Unfocus it
      chatInput.blur()
      // Hide it
      chatInput.style.display = 'none'
      // Hide extended chat history
      chat.style.maxHeight = 'var(--chatHeight)'
      chat.scrollTop = chat.scrollHeight // Stay bottom of the list
      this.requestUpdate()
      return 'custom' // custom hide
    }
    this.hide()

    client.on('chat', (packet) => {
      // Handle new message
      const fullmessage = JSON.parse(packet.message.toString())
      /** @type {MessagePart[]} */
      const msglist = []

      const readMsg = (msg) => {
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
            ...msg,
            text: msg.text,
            ...styles
          })
        } else if (msg.translate) {
          const tText = window.mcData.language[msg.translate] ?? msg.translate

          if (msg.with) {
            const splitted = tText.split(/%s|%\d+\$s/g)

            let i = 0
            splitted.forEach((part, j) => {
              msglist.push({ text: part, ...styles })

              if (j + 1 < splitted.length) {
                if (msg.with[i]) {
                  if (typeof msg.with[i] === 'string') {
                    readMsg({
                      ...styles,
                      text: msg.with[i]
                    })
                  } else {
                    readMsg({
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
              ...msg,
              text: tText,
              ...styles
            })
          }
        }

        if (msg.extra) {
          msg.extra.forEach(ex => {
            readMsg({ ...styles, ...ex })
          })
        }
      }

      readMsg(fullmessage)

      const lastId = this.messages.at(-1)?.id ?? 0
      this.messages = [...this.messages.slice(-this.messagesLimit), {
        parts: msglist,
        id: lastId + 1,
        fading: false,
        faded: false
      }]
      const message = this.messages.at(-1)

      chat.scrollTop = chat.scrollHeight // Stay bottom of the list
      // fading
      setTimeout(() => {
        message.fading = true
        this.requestUpdate()
        setTimeout(() => {
          message.faded = true
          this.requestUpdate()
        }, 3000)
      }, 5000)
    })
    // todo support hover content below, {action: 'show_text', contents: {text}}, and some other types
    // todo remove
    window.dummyMessage = () => {
      client.emit('chat', {
        message: "{\"color\":\"yellow\",\"translate\":\"multiplayer.player.joined\",\"with\":[{\"insertion\":\"pviewer672\",\"clickEvent\":{\"action\":\"suggest_command\",\"value\":\"/tell pviewer672 \"},\"hoverEvent\":{\"action\":\"show_entity\",\"contents\":{\"type\":\"minecraft:player\",\"id\":\"ecd0eeb1-625e-3fea-b16e-cb449dcfa434\",\"name\":{\"text\":\"pviewer672\"}}},\"text\":\"pviewer672\"}]}",
        position: 1,
        sender: "00000000-0000-0000-0000-000000000000",
      })
    }
    // window.dummyMessage()
  }

  renderMessagePart (/** @type {MessagePart} */{ bold, color, italic, strikethrough, text, underlined }) {
    const colorF = (color) => {
      return color.trim().startsWith('#') ? `color:${color}` : styles[color] ?? undefined
    }

    /** @type {string[]} */
    const applyStyles = [
      color ? colorF(color.toLowerCase()) + `; text-shadow: 1px 1px 0px ${colorShadow(colorF(color.toLowerCase()).replace('color:', ''))}` : styles.white,
      italic && styles.italic,
      bold && styles.bold,
      italic && styles.italic,
      underlined && styles.underlined,
      strikethrough && styles.strikethrough
    ].filter(Boolean)

    return html`
        <span
          class="chat-message-part"
          style="${applyStyles.join(';')}"
        >${text}</span>`
  }

  renderMessage (/** @type {Message} */message) {
    const classes = {
      'chat-message-fadeout': message.fading,
      'chat-message-fade': message.fading,
      'chat-message-faded': message.faded,
      'chat-message': true
    }

    return html`
      <li class=${classMap(classes)}>
        ${message.parts.map(msg => this.renderMessagePart(msg))}
      </li>
    `
  }

  render () {

    return html`
    <div class="chat-wrapper chat-messages-wrapper ${miscUiState.currentTouch ? 'display-mobile' : ''}">
      <div class="chat ${this.inChat ? 'opened' : ''}" id="chat-messages">
        <!-- its to hide player joined at random timings, todo add chat tests as well -->
        ${repeat(isCypress() ? [] : this.messages, (m) => m.id, (m) => this.renderMessage(m))}
      </div>
    </div>
    <div class="chat-wrapper chat-input-wrapper ${miscUiState.currentTouch ? 'input-mobile' : ''}">
      <div class="chat" id="chat-input">
        <input type="text" class="chat" id="chatinput" spellcheck="false" autocomplete="off"></input>
      </div>
    </div>
    `
  }
}

window.customElements.define('chat-box', ChatBox)
