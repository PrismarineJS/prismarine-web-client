import { getMCInstance } from '../..';
import BooleanOption from './settings/BooleanOption'
import IteratableOption from './settings/IteratableOption';
import SliderPercentageOption from './settings/SliderPercentageOption';

export const HIDE_GUI = new BooleanOption('Hide GUI', (settings) => {
  return settings.hideGUI
}, (settings, optionValues) => {
  settings.hideGUI = optionValues
})

export const GUI_SCALE = new IteratableOption('options.guiScale', (settings, optionValues) => {
  settings.guiScale = (settings.guiScale + optionValues) % getMCInstance().mccanvas.calcGuiScale(0);
}, (settings, optionValues) => {
  return settings.guiScale == 0 ? 'Gui Scale: Auto' : `Gui Scale: ${settings.guiScale}`;
});

export const MOUSE_SENSIBILITY_X = new SliderPercentageOption('Mouse Sensibility X', 0, 100, 1, (settings) => {
  return settings.mouseSensXValue;
}, (settings, optionValues) => {
  settings.mouseSensXValue = optionValues;
}, (settings, optionValues) => {
  return `${optionValues.translationKey}: ${~~(optionValues.normalizeValue(optionValues.get(settings)) * 100)}%`;
});

export const MOUSE_SENSIBILITY_Y = new SliderPercentageOption('Mouse Sensibility Y', 0, 100, 1, (settings) => {
  return settings.mouseSensYValue;
}, (settings, optionValues) => {
  settings.mouseSensYValue = optionValues;
}, (settings, optionValues) => {
  return `${optionValues.translationKey}: ${~~(optionValues.normalizeValue(optionValues.get(settings)) * 100)}%`;
});

export const RENDER_DISTANCE = new SliderPercentageOption('Render Distance', 2, 64, 1, (settings) => {
  return settings.renderDistanceChunks;
}, (settings, optionValues) => {
  settings.renderDistanceChunks = optionValues;
}, (settings, optionValues) => {
  return `${optionValues.translationKey}: ${optionValues.getter(settings)} Chunks`;
});