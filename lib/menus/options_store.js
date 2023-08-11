//@ts-check

import { LitElement } from 'lit'

export class CommonOptionsScreen extends LitElement {
  options = {}

  defineOptions (props) {
    for (const [name, { defaultValue, convertFn }] of Object.entries(props)) {
      Object.defineProperty(this.options, name, {
        get () {
          let value = window.localStorage.getItem(name) ? convertFn(window.localStorage.getItem(name)) : defaultValue
          if (isNaN(value)) value = defaultValue
          return value
        },
        set (value) {
          window.localStorage.setItem(name, `${convertFn(value)}`)
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
  }
}
