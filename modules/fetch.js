const config = require('../config.json')

let hasExtension
let version
if (chrome.runtime && config.extension_id) {
  try {
    chrome.runtime.sendMessage(config.extension_id, { type: 'version' }, response => {
      hasExtension = true
      version = response.version
    })
  } catch (e) {
    hasExtension = false
  }
} else {
  hasExtension = false
}

module.exports = (...args) => {
  if (!hasExtension) {
    return window.fetch
  }

  return new Promise(resolve => {
    chrome.runtime.sendMessage(config.extension_id || '', { type: 'fetch', req: args }, response => {
      resolve({
        status: response.status,
        text: async function () {
          return response.text
        }
      })
    })
  })
}
