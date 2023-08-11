//@ts-check

// create lit element
const { LitElement, html, css } = require('lit')
const { proxy, subscribe } = require('valtio/vanilla')

// move to globalState?
export const notification = proxy({
  show: false,
  autoHide: true,
  message: '',
  type: 'info',
})

window.notification = notification

class Notification extends LitElement {
  render () {
    const show = notification.show && notification.message
    return html`
      <div class="notification notification-${notification.type} ${show ? 'notification-show' : ''}">
        ${notification.message}
      </div>
    `
  }

  constructor () {
    super()
    let timeout
    subscribe(notification, () => {
      if (timeout) clearTimeout(timeout)
      this.requestUpdate()
      if (!notification.autoHide) return
      timeout = setTimeout(() => {
        notification.show = false
      }, 3000)
    })
  }

  static get styles () {
    return css`
      .notification {
        position: absolute;
        bottom: 0;
        right: 0;
        min-width: 200px;
        padding: 10px;
        white-space: nowrap;
        font-size: 12px;
        color: #fff;
        text-align: center;
        background: #000;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
      }

      .notification-info {
        background: #000;
      }

      .notification-error {
        background: #d00;
      }

      .notification-show {
        opacity: 1;
      }
    `
  }
}

window.customElements.define('pmui-notification', Notification)
