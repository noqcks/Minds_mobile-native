import { tokens } from './tokens';

const { color } = tokens;

export const createDarkButtonTheme = (
  variantName: string,
  colorName: string,
) => ({
  [`background${variantName}`]: color[`${colorName}-500`],
  [`backgroundFocus${variantName}`]: color[`${colorName}-700`],
  [`backgroundPress${variantName}`]: color[`${colorName}-800`],
  [`backgroundHover${variantName}`]: color[`${colorName}-800`],

  [`borderColor${variantName}`]: color[`${colorName}-400`],
  [`borderColorFocus${variantName}`]: color[`${colorName}-600`],
  [`borderColorPress${variantName}`]: color[`${colorName}-600`],
  [`borderColorHover${variantName}`]: color[`${colorName}-800`],

  [`color${variantName}`]: color['grey-200'],
  [`colorFocus${variantName}`]: color['grey-200'],
  [`colorPress${variantName}`]: color['grey-200'],
  [`colorHover${variantName}`]: color['grey-200'],
  [`colorDisabled${variantName}`]: color['grey-500'],
});

export const createLightButtonTheme = (
  variantName: string,
  colorName: string,
) => ({
  [`background${variantName}`]: color[`${colorName}-300`],
  [`backgroundFocus${variantName}`]: color[`${colorName}-400`],
  [`backgroundPress${variantName}`]: color[`${colorName}-500`],
  [`backgroundHover${variantName}`]: color[`${colorName}-500`],

  [`borderColor${variantName}`]: color[`${colorName}-400`],
  [`borderColorFocus${variantName}`]: color[`${colorName}-600`],
  [`borderColorPress${variantName}`]: color[`${colorName}-600`],
  [`borderColorHover${variantName}`]: color[`${colorName}-800`],

  [`color${variantName}`]: color['grey-800'],
  [`colorFocus${variantName}`]: color['grey-800'],
  [`colorPress${variantName}`]: color['grey-800'],
  [`colorHover${variantName}`]: color['grey-800'],
  [`colorDisabled${variantName}`]: color['grey-500'],
});
