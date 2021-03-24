import AbstractSlider from "./AbstractSlider";

export default class OptionSlider extends AbstractSlider {
  constructor(settings, xIn, yIn, widthIn, heightIn, optionIn) {
    super(xIn, yIn, widthIn, heightIn, '', (optionIn.normalizeValue(optionIn.get(settings))));
    this.settings = settings;
    this.option = optionIn;
    this.setName();
  }

  setSaveOptionValue() {
    this.option.set(this.settings, this.option.denormalizeValue(this.sliderValue));
    this.settings.saveOptions();
  }

  setName() {
    this.message = this.option.getName(this.settings);
  }
}
