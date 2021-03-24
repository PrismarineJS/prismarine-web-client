import OptionSlider from "../gui/widgets/OptionSlider";
import MathHelper from "../utils/MathHelper";

export default class SliderPercentageOption {
  constructor(translationKey, minValueIn, maxValueIn, stepSizeIn, getter, setter, getDisplayString) {
    this.translationKey = translationKey;
    this.minValue = minValueIn;
    this.maxValue = maxValueIn;
    this.stepSize = stepSizeIn;
    this.getter = getter;
    this.setter = setter;
    this.getDisplayStringFunc = getDisplayString;
  }

  createWidget(options, xIn, yIn, widthIn) {
    return new OptionSlider(options, xIn, yIn, widthIn, 20, this);
  }

  normalizeValue(value) {
    return MathHelper.clamp((this.snapToStepClamp(value) - this.minValue) / (this.maxValue - this.minValue), 0, 1);
  }

  denormalizeValue(value) {
    return this.snapToStepClamp(MathHelper.lerp(MathHelper.clamp(value, 0, 1), this.minValue, this.maxValue));
  }

  snapToStepClamp(valueIn) {
    if(this.stepSize > 0) valueIn = (this.stepSize * (Math.round(valueIn / this.stepSize)));

    return MathHelper.clamp(valueIn, this.minValue, this.maxValue);
  }

  getMinValue() {
    return this.minValue;
  }

  getMaxValue() {
    return this.maxValue;
  }

  setMaxValue(valueIn) {
    this.maxValue = valueIn;
  }

  set(options, valueIn) {
    this.setter(options, valueIn);
  }

  get(options) {
    return this.getter(options);
  }

  getName(options) {
    return this.getDisplayStringFunc(options, this);
  }
}