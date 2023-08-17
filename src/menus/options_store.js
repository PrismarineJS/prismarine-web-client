//@ts-check

import { LitElement } from 'lit'

export class CommonOptionsScreen extends LitElement {
  options = {}

  defineOptions (props) {
    for (const [name, { defaultValue, convertValue = (v) => v, convertFn = convertValue }] of Object.entries(props)) {
      Object.defineProperty(this.options, name, {
        get () {
          let value = window.localStorage.getItem(name) ? convertFn(window.localStorage.getItem(name)) : defaultValue
          if (isNaN(value)) value = defaultValue
          return value
        },
        set (value) {
          window.localStorage.setItem(name, `${convertValue(value)}`)
        }
      })
      this[name] = this.options[name]
    }
  }
  /**
   * @param {string} name
   * @param {any} value
   */
  changeOption (name, value) {
    this.options[name] = value
    this[name] = this.options[name]
    // todo migrate to it
    window.dispatchEvent(new CustomEvent('option-change', { detail: { name, value } }))
  }
}
