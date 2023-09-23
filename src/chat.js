//@ts-check
const { LitElement, html, css } = require('lit')
const { isMobile } = require('./menus/components/common')
const { activeModalStack, hideCurrentModal, showModal, miscUiState } = require('./globalState')
import { repeat } from 'lit/directives/repeat.js'
import { classMap } from 'lit/directives/class-map.js'
import { isCypress } from './utils'
import { tryHandleBuiltinCommand } from './builtinCommands'
import { notification } from './menus/notification'
import { options } from './optionsStorage'

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
            pointer-events: none;
        }

        .chat-input-wrapper {
            bottom: 1px;
            width: calc(100% - 3px);
            position: fixed;
            left: 1px;
            box-sizing: border-box;
            background-color: rgba(0, 0, 0, 0);
        }
        .chat-input {
          box-sizing: border-box;
          width: 100%;
        }
        .chat-completions {
          position: absolute;
          /* position this bottom on top of parent */
          top: 0;
          left: 0;
          transform: translateY(-100%);
          /* width: 150px; */
          display: flex;
          padding: 0 2px; // input padding
          width: 100%;
        }
        .input-mobile .chat-completions {
          transform: none;
          top: 15px; // input height
        }
        .chat-completions-pad-text {
          pointer-events: none;
          white-space: pre;
          opacity: 0;
          overflow: hidden;
        }
        .chat-completions-items {
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          /* justify-content: flex-end; */
          /* probably would be better to replace with margin, not sure */
          padding: 2px;
          max-height: 100px;
          overflow: auto;
        }
        .chat-completions-items::-webkit-scrollbar {
            width: 5px;
            background-color: rgb(24, 24, 24);
        }
        .chat-completions-items::-webkit-scrollbar-thumb {
            background-color: rgb(50, 50, 50);
        }
        .chat-completions-items > div {
          cursor: pointer;
        }
        .chat-completions-items > div:hover {
          text-shadow: 0px 0px 6px white;
        }
        .input-mobile .chat-completions-items {
          justify-content: flex-start;
        }

        .input-mobile {
          top: 1px;
        }

        .display-mobile {
          top: 40px;
        }

        .chat, .chat-input {
            color: white;
            font-size: 10px;
            margin: 0px;
            line-height: 100%;
            text-shadow: 1px 1px 0px #3f3f3f;
            font-family: mojangles, minecraft, monospace;
            max-height: var(--chatHeight);
        }
        .chat {
          pointer-events: none;
          overflow: hidden;
          width: 100%;
        }
        .chat.opened {
            pointer-events: auto;
        }

        input[type=text], #chatinput {
            background-color: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(0, 0, 0, 0);
            outline: none;
            pointer-events: auto;
            /* styles reset */
            padding-top: 1px;
            padding-bottom: 1px;
            padding-left: 2px;
            padding-right: 2px;
            height: 15px;
        }

        .chat-mobile-hidden {
          width: 8px;
          height: 0;
          position: absolute;
          display: block !important;
          opacity: 0;
          pointer-events: none;
        }
        .chat-mobile-hidden:nth-last-child(1) {
          height: 8px;
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
      },
      completionItems: {
        type: Array
      },
      completePadText: {
        type: String
      }
    }
  }

  constructor () {
    super()
    this.chatHistoryPos = 0
    this.chatHistory = JSON.parse(window.sessionStorage.chatHistory || '[]')
    this.completePadText = ''
    this.messagesLimit = 200
    /** @type {string[]} */
    this.completionItemsSource = []
    /** @type {string[]} */
    this.completionItems = []
    this.completeRequestValue = ''
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

    notification.show = false
    const chat = this.shadowRoot.getElementById('chat-messages')
    /** @type {HTMLInputElement} */
    // @ts-ignore
    const chatInput = this.shadowRoot.getElementById('chatinput')

    showModal(this)

    // Exit the pointer lock
    document.exitPointerLock?.()
    // Show extended chat history
    chat.style.maxHeight = 'var(--chatHeight)'
    chat.scrollTop = chat.scrollHeight // Stay bottom of the list
    // handle / and other snippets
    this.updateInputValue(initialText)
    this.chatHistoryPos = this.chatHistory.length
    // to show
    this.requestUpdate()
    setTimeout(() => {
      // after component update display
      chatInput.focus()
    })
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
    this.chatInput = chatInput

    // Show chat
    chat.style.display = 'block'

    let savedCurrentValue
    // Chat events
    document.addEventListener('keydown', e => {
      if (activeModalStack.slice(-1)[0]?.elem !== this) return
      if (e.code === 'ArrowUp') {
        if (this.chatHistoryPos === 0) return
        if (this.chatHistoryPos === this.chatHistory.length) {
          savedCurrentValue = chatInput.value
        }
        this.updateInputValue(this.chatHistory[--this.chatHistoryPos] || '')
      } else if (e.code === 'ArrowDown') {
        if (this.chatHistoryPos === this.chatHistory.length) return
        this.updateInputValue(this.chatHistory[++this.chatHistoryPos] || savedCurrentValue || '')
      }
    })

    document.addEventListener('keypress', e => {
      if (!this.inChat && activeModalStack.length === 0) {
        return false
      }

      if (!this.inChat) return

      e.stopPropagation()

      if (e.code === 'Enter') {
        const message = chatInput.value
        if (message) {
          this.chatHistory.push(message)
          window.sessionStorage.chatHistory = JSON.stringify(this.chatHistory)
          const builtinHandled = tryHandleBuiltinCommand(message)
          if (!builtinHandled) {
            client.write('chat', { message })
          }
        }
        hideCurrentModal()
      }
    })

    this.hide = () => {
      this.completionItems = []
      // Clear chat input
      chatInput.value = ''
      // Unfocus it
      chatInput.blur()
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
          const tText = window.loadedData.language[msg.translate] ?? msg.translate

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

    chatInput.addEventListener('input', (e) => {
      const completeValue = this.getCompleteValue()
      this.completePadText = completeValue === '/' ? '' : completeValue
      if (this.completeRequestValue === completeValue) {
        const lastWord = chatInput.value.split(' ').at(-1)
        this.completionItems = this.completionItemsSource.filter(i => i.startsWith(lastWord))
        return
      }
      this.completeRequestValue = ''
      this.completionItems = []
      this.completionItemsSource = []
      if (options.autoRequestCompletions && this.getCompleteValue() === '/') {
        void this.fetchCompletion()
      }
    })
    chatInput.addEventListener('keydown', (e) => {
      if (e.code === 'Tab') {
        if (this.completionItems.length) {
          this.tabComplete(this.completionItems[0])
        } else {
          void this.fetchCompletion(chatInput.value)
        }
        e.preventDefault()
      }
      if (e.code === 'Space' && options.autoRequestCompletions) {
        // alternative we could just simply use keyup, but only with keydown we can display suggestions popup as soon as possible
        void this.fetchCompletion(this.getCompleteValue(chatInput.value + ' '))
      }
    })
  }

  getCompleteValue (value = this.chatInput.value) {
    const valueParts = value.split(' ')
    const lastLength = valueParts.at(-1).length
    const completeValue = lastLength ? value.slice(0, -lastLength) : value
    if (valueParts.length === 1 && value.startsWith('/')) return '/'
    return completeValue
  }

  async fetchCompletion (value = this.getCompleteValue()) {
    this.completionItems = []
    this.completeRequestValue = value
    const items = await bot.tabComplete(value, true, true)
    if (value !== this.completeRequestValue) return
    this.completionItems = items
    this.completionItemsSource = items
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

  updateInputValue (value) {
    const { chatInput } = this
    chatInput.value = value
    chatInput.dispatchEvent(new Event('input'))
    setTimeout(() => {
      chatInput.setSelectionRange(value.length, value.length)
    }, 0)
  }

  auxInputFocus (fireKey) {
    document.dispatchEvent(new KeyboardEvent('keydown', { code: fireKey }))
    this.chatInput.focus()
  }

  tabComplete (item) {
    const base = this.completeRequestValue === '/' ? '' : this.completeRequestValue
    this.updateInputValue(base + item)
    // would be cool but disabled because some comands don't need args (like ping)
    // // trigger next tab complete
    // this.chatInput.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }))
    this.chatInput.focus()
  }

  render () {

    return html`
    <div class="chat-wrapper chat-messages-wrapper ${miscUiState.currentTouch ? 'display-mobile' : ''}">
      <div class="chat ${this.inChat ? 'opened' : ''}" id="chat-messages">
        <!-- its to hide player joined at random timings, todo add chat tests as well -->
        ${repeat(isCypress() ? [] : this.messages, (m) => m.id, (m) => this.renderMessage(m))}
      </div>
    </div>
    <div class="chat-wrapper chat-input-wrapper ${miscUiState.currentTouch ? 'input-mobile' : ''}" style="display: ${this.inChat ? 'block' : 'none'}">
      <div class="chat-input">
        ${this.completionItems.length ? html`<div class="chat-completions">
          <div class="chat-completions-pad-text">${this.completePadText}</div>
          <div class="chat-completions-items">
            ${repeat(this.completionItems, (i) => i, (i) => html`<div @click=${() => this.tabComplete(i)}>${i}</div>`)}
          </div>
        </div>` : ''}
        <input type="text" class="chat-mobile-hidden" id="chatinput-next-command" spellcheck="false" autocomplete="off" @focus=${() => {
        this.auxInputFocus('ArrowUp')
      }}></input>
        <input type="text" class="chat-input" id="chatinput" spellcheck="false" autocomplete="off" aria-autocomplete="both"></input>
        <input type="text" class="chat-mobile-hidden" id="chatinput-prev-command" spellcheck="false" autocomplete="off" @focus=${() => {
        this.auxInputFocus('ArrowDown')
      }}></input>
      </div>
    </div>
    `
  }
}

window.customElements.define('chat-box', ChatBox)
