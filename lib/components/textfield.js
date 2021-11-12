const { LitElement, html, css } = require('lit')

class LegacyTextField extends LitElement {
  constructor () {
    super()
    this.size = '200px'
    this.id = ''
    this.value = ''
    this.label = ''
  }

  static get properties () {
    return {
      size: {
        type: String,
        attribute: 'field-width'
      },
      label: {
        type: String,
        attribute: 'field-label'
      },
      id: {
        type: String,
        attribute: 'field-id'
      },
      value: {
        type: String,
        attribute: 'field-value'
      }
    }
  }

  static get styles () {
    return css`
      :host {
        --guiScale: var(--guiScaleFactor, 3);
      }

      .text-field-div {
        --borderColor: grey;
        position: relative;
        padding: 0;
        margin: 0;
        
        width: 100%;
        height: calc(22px * var(--guiScale));

        box-sizing: border-box;

        background: black;
        border: calc(1px * var(--guiScale)) solid var(--borderColor);

        padding: calc(4px * var(--guiScale));
      }

      .text-field-div:focus-within {
        --borderColor: white;
      }

      .text-field-div label {
        position: absolute;
        z-index: 2;
        pointer-events: none;
      
        bottom: calc(21px * var(--guiScale));
        left: 0;
        padding: 0;
        margin: 0;

        font-family: mojangles, minecraft, monospace;
        font-size: calc(10px * var(--guiScale));
      
        color: rgb(206, 206, 206);
        text-shadow: calc(1px * var(--guiScale)) calc(1px * var(--guiScale)) black;
      }

      .legacy-text-field {
        outline: none;
        border: none;
        background: none;
        padding: 0;
        margin: 0;

        width: 100%;
        height: 100%;

        font-family: mojangles, minecraft, monospace;
        font-size: calc(8px * var(--guiScale));

        color: white;
        text-shadow: calc(1px * var(--guiScale)) calc(1px * var(--guiScale)) black;
      }
    `
  }

  render () {
    return html`
      <div class="text-field-div" style="width: calc(${this.size.endsWith('%') ? this.size : this.size + ' * var(--guiScale)'});">
        <label for="${this.id}">${this.label}</label>
        <input id="${this.id}" type="text" name="" spellcheck="false" required="" autocomplete="off" value="${this.value}" @input=${(e) => { this.value = e.target.value }} class="legacy-text-field">
      </div>
    `
  }
}

window.customElements.define('legacy-text-field', LegacyTextField)
