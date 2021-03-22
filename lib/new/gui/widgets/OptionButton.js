import Button from './Button'

export default class OptionButton extends Button {
  constructor (x, y, width, height, enumOptions, title, onPressFunc) {
    super(x, y, width, height, title, onPressFunc)
    this.enumOptions = enumOptions
  }
}
