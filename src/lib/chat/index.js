const { LitElement, html, css } = require('lit-element')

const colors = {
  black: '#000000',
  dark_blue: '#0000AA',
  dark_green: '#00AA00',
  dark_aqua: '#00AAAA',
  dark_red: '#AA0000',
  dark_purple: '#AA00AA',
  gold: '#FFAA00',
  gray: '#AAAAAA',
  dark_gray: '#555555',
  blue: '#5555FF',
  green: '#55FF55',
  aqua: '#55FFFF',
  red: '#FF5555',
  light_purple: '#FF55FF',
  yellow: '#FFFF55',
  white: '#FFFFFF'
}

const dictionary = {
  'chat.stream.emote': '(%s) * %s %s',
  'chat.stream.text': '(%s) <%s> %s',
  // 'chat.type.achievement': '%s has just earned the achievement %s', // 1.8? Not tested
  // 'chat.type.advancement.task': '%s has just earned the advancement %s',
  // 'chat.type.advancement.goal': '%s has just reached the goal %s',
  // 'chat.type.advancement.challenge': '%s did a challenge lolol %s',
  'chat.type.admin': '[%s: %s]',
  'chat.type.announcement': '[%s] %s',
  'chat.type.emote': '* %s %s',
  'chat.type.text': '<%s> %s'
}

class ChatBox extends LitElement {
  static get styles () {
    return css(require('./index.css'))
  }

  render () {
    return html`
    <div id="chat-wrapper" class="chat-wrapper chat-display-wrapper">
    <div class="chat" id="chat">
      <p>Welcome to prismarine-web-client! Chat appears here.</p>
    </div>
    </div>
    <div id="chat-wrapper2" class="chat-wrapper chat-input-wrapper">
      <div class="chat" id="chat-input">
        <input type="text" class="chat" id="chatinput"></input>
      </div>
    </div>
    `
  }

  init (client, renderer) {
    this.inChat = false
    const chat = this.shadowRoot.querySelector('#chat')
    const gameMenu = document.getElementById('game-menu')
    const chatInput = this.shadowRoot.querySelector('#chatinput')

    const chatHistory = []
    let chatHistoryPos = 0

    renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock ||
            renderer.domElement.mozRequestPointerLock ||
            renderer.domElement.webkitRequestPointerLock

    // Show chat
    chat.style.display = 'block'

    const self = this

    // Esc event - Doesnt work with onkeypress?!
    document.addEventListener('keydown', e => {
      if (gameMenu.inMenu) return
      if (!self.inChat) return
      e = e || window.event
      if (e.keyCode === 27 || e.key === 'Escape' || e.key === 'Esc') {
        disableChat()
      } else if (e.keyCode === 38) {
        if (chatHistoryPos === 0) return
        chatInput.value = chatHistory[--chatHistoryPos] !== undefined ? chatHistory[chatHistoryPos] : ''
      } else if (e.keyCode === 40) {
        if (chatHistoryPos === chatHistory.length) return
        chatInput.value = chatHistory[++chatHistoryPos] !== undefined ? chatHistory[chatHistoryPos] : ''
      }
    })

    // Chat events
    document.addEventListener('keypress', e => {
      if (gameMenu.inMenu) return
      e = e || window.event
      if (self.inChat === false) {
        if (e.code === 'KeyT') {
          setTimeout(() => enableChat(false), 0)
        }

        if (e.code === 'Slash') {
          setTimeout(() => enableChat(true), 0)
        }
        return false
      }

      if (!self.inChat) return
      e.stopPropagation()
      if (e.code === 'Enter') {
        chatHistory.push(chatInput.value)
        client.write('chat', { message: chatInput.value })
        disableChat()
      }
    })
    // Enable inputs back when focused
    /* document.addEventListener("pointerlockchange", function(event) {
            const canvas = document.getElementById("noa-canvas");
            if (
            document.pointerLockElement === canvas ||
            document.mozPointerLockElement === canvas
            ) {
            // Someone focused the game back so we hide chat.
            chatState.inChat = false;
            hideChat();
            }
        }); */
    function enableChat (isCommand) {
      // Set inChat value
      self.inChat = true
      // Exit the pointer lock
      document.exitPointerLock()
      // Show chat input
      chatInput.style.display = 'block'
      // Show extended chat history
      chat.style.maxHeight = 'calc(90px * 8)'
      chat.scrollTop = chat.scrollHeight // Stay bottom of the list
      if (isCommand) { // handle commands
        chatInput.value = '/'
      }
      // Focus element
      chatInput.focus()
      chatHistoryPos = chatHistory.length
    }

    function disableChat () {
      // Set inChat value
      self.inChat = false

      // Hide chat
      hideChat()

      renderer.domElement.requestPointerLock()
    }

    function hideChat () {
      // Clear chat input
      chatInput.value = ''
      // Unfocus it
      chatInput.blur()
      // Hide it
      chatInput.style.display = 'none'
      // Hide extended chat history
      chat.style.maxHeight = 'calc(90px * 4)'
      chat.scrollTop = chat.scrollHeight // Stay bottom of the list
    }

    function readExtra (extra) {
      const shouldReturn = []
      for (const i in extra) {
        if (extra[i].text) {
          shouldReturn.push({
            text: extra[i].text,
            color: extra[i].color,
            bold: !!extra[i].bold,
            italic: !!extra[i].italic,
            underlined: !!extra[i].underlined,
            strikethrough: !!extra[i].strikethrough,
            obfuscated: !!extra[i].obfuscated
          })
        } else {
          readExtra(extra).forEach(function (el) {
            shouldReturn.push(el)
          })
        }
      }
      return shouldReturn
    }

    client.on('chat', (packet) => {
      // Reading of chat message
      const fullmessage = JSON.parse(packet.message.toString())
      let msglist = []
      if (
        fullmessage.extra &&
            fullmessage.extra.length > 0 &&
            !fullmessage.translate
      ) {
        msglist = readExtra(fullmessage.extra)
      } else if (fullmessage.text && fullmessage.text.length > 0) {
        msglist.push({ text: fullmessage.text, color: undefined })
      } else if (dictionary[fullmessage.translate]) {
        let msg = dictionary[fullmessage.translate]
        fullmessage.with.forEach(obj => {
          if (obj.insertion && obj.text) {
            msg = msg.replace('%s', obj.text)
          }
          if (obj.extra) {
            if (obj.text && obj.text.length > 0) {
              msglist.push({ text: obj.text, color: undefined })
            } else {
              const text = readExtra(obj.extra)
              if (text.length > 1) {
                console.log('Unsupported chat alert', text)
              }
              msg = msg.replace('%s', text[0].text)
              msglist.push({ text: msg, color: undefined })
            }
          }
        })
      } else {
        // msglist.push({
        //   text:
        //     "Unsupported message (Please report this):\n" +
        //     JSON.stringify(fullmessage),
        //   color: undefined
        // });
      }
      const li = document.createElement('li')
      msglist.forEach(msg => {
        let span = document.createElement('span')
        span.appendChild(document.createTextNode(msg.text))
        if (msg.color) { span.style.color = colors[msg.color.toLowerCase()] }
        if (msg.bold) { span.style.fontWeight = '900' }
        if (msg.italic) { span.style.fontStyle = 'italic' }
        if (msg.underlined) { span.style.textDecoration = 'underline' }
        if (msg.strikethrough) { span.style.textDecoration += ' line-through' }
        li.appendChild(span)
      })
      chat.appendChild(li)
      chat.scrollTop = chat.scrollHeight // Stay bottom of the list
    })

    hideChat()
  }
}

window.customElements.define('chat-box', ChatBox)
