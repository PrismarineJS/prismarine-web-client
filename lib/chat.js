const { LitElement, html, css } = require('lit')

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
    return css`
        .chat-wrapper {
            position: fixed;
            z-index:10;
        }

        .chat-display-wrapper {
            bottom: calc(8px * 16);
            padding: 4px;
            max-height: calc(90px * 8);
            width: calc(320px * 4);
        }

        .chat-input-wrapper {
            bottom: calc(2px * 16);
            width: 100%;
            overflow: hidden;
            background-color: rgba(0, 0, 0, 0);
        }

        .chat {
            overflow: hidden;
            color: white;
            font-size: 16px;
            margin: 0px;
            line-height: 100%;
            text-shadow: 2px 2px 0px #3f3f3f;
            font-family: mojangles, minecraft, monospace;
            width: 100%;
            max-height: calc(90px * 8);
        }

        input[type=text], #chatinput {
            background-color: rgba(0, 0, 0, 0.5);
            display: none;
        }
        
        .chat-message {
            display: block;
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
      document.querySelector('#chatbox').shadowRoot.querySelectorAll('.chat-message').forEach(e => e.classList.add('chat-message-chat-opened'))
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
      document.querySelector('#chatbox').shadowRoot.querySelectorAll('.chat-message').forEach(e => e.classList.remove('chat-message-chat-opened'))
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
                console.log('Unsupported chat alert :(')
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
        const span = document.createElement('span')
        span.appendChild(document.createTextNode(msg.text))
        span.setAttribute(
          'style',
                `${msg.color ? styles[msg.color.toLowerCase()] : styles.white}; ${
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
