const { LitElement, html, css } = require('lit')

class EditBox extends LitElement {
  static get styles () {
    return css`
      .edit-container {
        position: relative;
        width: 200px;
        height: 20px;
        background: black;
        border: 1px solid grey;
      }

      .edit-container:hover,
      .edit-container:focus-within {
        border-color: white;
      }

      .edit-container label {
        position: absolute;
        z-index: 2;
        pointer-events: none;
        bottom: 21px;
        left: 0;
        font-size: 10px;
        color: rgb(206, 206, 206);
        text-shadow: 1px 1px black;
      }

      .edit-box {
        position: relative;
        outline: none;
        border: none;
        background: none;
        left: 1px;
        width: calc(100% - 2px);
        height: 100%;
        font-family: minecraft, mojangles, monospace;
        font-size: 10px;
        color: white;
        text-shadow: 1px 1px #222;
      }
    `
  }

  constructor () {
    super()
    this.width = '200px'
    this.id = ''
    this.value = ''
    this.label = ''
  }

  static get properties () {
    return {
      width: {
        type: String,
        attribute: 'pmui-width'
      },
      id: {
        type: String,
        attribute: 'pmui-id'
      },
      label: {
        type: String,
        attribute: 'pmui-label'
      },
      value: {
        type: String,
        attribute: 'pmui-value'
      }
    }
  }

  render () {
    return html`
      <div
        class="edit-container"
        style="width: ${this.width};"
      >
        <label for="${this.id}">${this.label}</label>
        <input
          id="${this.id}"
          type="text"
          name=""
          spellcheck="false"
          required=""
          autocomplete="off"
          value="${this.value}"
          @input=${(e) => { this.value = e.target.value }}
          class="edit-box">
      </div>
    `
  }
}

window.customElements.define('pmui-editbox', EditBox)
