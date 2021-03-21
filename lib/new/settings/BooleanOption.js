import AbstractOption from "./AbstractOption";
import OptionButton from "../gui/widgets/OptionButton";

export default class BooleanOption extends AbstractOption {
  constructor(translationKeyIn, getter, setter) {
    super(translationKeyIn);
    this.getter = getter;
    this.setter = setter;
  }

  set(options, valueIn) {
    this.setPriv(options, valueIn === 'true');
  }

  nextValue(options) {
    this.setPriv(options, !this.get(options));
    options.saveOptions();
  }

  setPriv(options, valueIn) {
    this.setter(options, valueIn);
  }

  get(options) {
    return this.getter(options);
  }

  createWidget(options, xIn, yIn, widthIn) {
    return new OptionButton(xIn, yIn, widthIn, 20, this, this.getName(options), (button) => {
      this.nextValue(options);
      button.setMessage(this.getName(options));
    });
  }

  getName(options) {
    return this.getBaseMessageTranslation() + ': ' + (this.get(options) === true ? 'ON' : 'OFF');
  }
}