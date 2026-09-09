export { default as ButtonToggle } from '../src/components/ButtonToggle.astro';
export { default as Input } from '../src/components/Input.astro';
export { default as Modal } from '../src/components/Modal.astro';
export { setupForm } from './behaviors/form/formValidation';
export { FIELD_LIMITS, NAME_PATTERN, normalize, hasWhitespace, hasDoubleSpaces, hasRepeatedChars, isValidEmailShape, getPasswordRequirements } from './behaviors/form/rules';
export * from '../src/utils/overlay';

// export * from './compon/*.svg';
export * from './icons/outline/*.svg';