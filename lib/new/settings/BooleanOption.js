import OptionButton from '../gui/widgets/OptionButton'

export default class BooleanOption {
  constructor (translationKeyIn, getter, setter) {
    this.translationKeyIn = translationKeyIn;
    this.getter = getter
    this.setter = setter
  }

  set(options, valueIn) {
    this.setter(options, valueIn === 'true')
  }

  nextValue(options) {
    this.setter(options, !this.getter(options))
    options.saveOptions();
  }

  createWidget (options, xIn, yIn, widthIn) {
    return new OptionButton(xIn, yIn, widthIn, 20, this, this.getName(options), (button) => {
      this.nextValue(options)
      button.message = this.getName(options)
    })
  }

  getName(options) {
    return this.translationKeyIn + ': ' + (this.getter(options) === true ? 'ON' : 'OFF')
  }
}
