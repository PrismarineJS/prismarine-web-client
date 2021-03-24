import OptionButton from "../gui/widgets/OptionButton";

export default class IteratableOption {
  constructor(translationKeyIn, setterIn, getterIn) {
    this.translationKeyIn = translationKeyIn;
    this.setter = setterIn;
    this.getter = getterIn;
  }

  setValueIndex(options, valueIn) {
    this.setter(options, valueIn);
    options.saveOptions();
  }

  createWidget(options, xIn, yIn, widthIn) {
    return new OptionButton(xIn, yIn, widthIn, 20, this, this.getName(options), (button) => {
      this.setValueIndex(options, 1);
      button.message = this.getName(options);
    });
  }

  getName(settings) {
    return this.getter(settings, this);
  }
}