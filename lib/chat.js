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

export function init (client, renderer) {
  const chat = document.querySelector('#chat')
  const chatInput = document.querySelector('#chatinput')

  const chatHistory = []
  let chatHistoryPos = 0

  renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock ||
      renderer.domElement.mozRequestPointerLock ||
      renderer.domElement.webkitRequestPointerLock

  // Show chat
  chat.style.display = 'block'

  const chatState = {
    inChat: false
  }

  // Esc event - Doesnt work with onkeypress?!
  document.onkeydown = function (e) {
    if (!chatState.inChat) return
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
  }

  // Chat events
  document.onkeypress = function (e) {
    e = e || window.event
    if (chatState.inChat === false) {
      if (e.code === 'KeyT') {
        enableChat(false)
      }

      if (e.code === 'Slash') {
        enableChat(true)
      }
      return false
    }

    if (!chatState.inChat) return
    e.stopPropagation()
    if (e.code === 'Enter') {
      chatHistory.push(chatInput.value)
      client.write('chat', { message: chatInput.value })
      disableChat()
    }
  }
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
    chatState.inChat = true
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
    chatState.inChat = false

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
  })

  hideChat()

  return chatState
}
