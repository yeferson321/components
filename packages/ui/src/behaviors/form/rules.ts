export const normalize = (value: string) => value.normalize("NFC").trim();

export const NAME_PATTERN = /^[\p{L} '’-]+$/u;
export const REPEATED_CHARS_PATTERN = /(.)\1{2,}/u;
export const LETTER_PATTERN = /\p{L}/u;
export const NUMBER_PATTERN = /\p{Nd}/u;
export const SPECIAL_PATTERN = /[\p{P}$+=]/u;
export const WHITESPACE_PATTERN = /\p{White_Space}/u;

export const fieldLimits = {
    name: { minLength: 2, maxLength: 60 },
    email: { minLength: 5, maxLength: 255 },
    password: { minLength: 8, maxLength: 72 },
};