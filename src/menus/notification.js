//@ts-check

// create lit element
const { LitElement, html, css } = require('lit')
const { proxy, subscribe } = require('valtio/vanilla')

// move to globalState?
// rename current (non-stackable) notification to one-time (system) notification
const initialNotification = {
  show: false,
  autoHide: true,
  message: '',
  type: 'info',
}
export const notification = proxy(initialNotification)

export const showNotification = (/** @type {Partial<typeof notification>} */newNotification) => {
  Object.assign(notification, { show: true, ...newNotification }, initialNotification)
}

window.notification = notification

class Notification extends LitElement {
  static get properties () {
    return {
      renderHtml: { type: Boolean },
    }
  }

  render () {
    if (!this.renderHtml) return
    const show = notification.show && notification.message
    return html`
      <div @transitionend=${this.ontransitionend} class="notification notification-${notification.type} ${show ? 'notification-show' : ''}">
        ${notification.message}
      </div>
    `
  }

  ontransitionend = (event) => {
    if (event.propertyName !== 'opacity') return

    if (!notification.show) {
      this.renderHtml = false
    }
  }

  constructor () {
    super()
    this.renderHtml = false
    let timeout
    subscribe(notification, () => {
      if (timeout) clearTimeout(timeout)
      this.requestUpdate()
      if (!notification.show) return
      this.renderHtml = true
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
