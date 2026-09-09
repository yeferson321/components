export const normalize = (value: string) => value.normalize("NFC").trim();

export const FIELD_LIMITS = {
    email: { minLength: 6, maxLength: 120 },
    name: { minLength: 2, maxLength: 120 },
    password: { minLength: 10, maxLength: 64 },
} as const;

export const NAME_PATTERN = /^[\p{L} '’-]+$/u;

export const hasWhitespace = (value: string) => /\p{White_Space}/u.test(value);
export const hasDoubleSpaces = (value: string) => / {2,}/.test(value);
export const hasRepeatedChars = (value: string) => /(.)\1{2,}/u.test(value);

export const isValidEmailShape = (email: string) => {
    if (hasWhitespace(email)) return false;
    if (!email.includes("@")) return false;

    const [username, domain] = email.split("@");
    return Boolean(username && domain);
};

export const getPasswordRequirements = (password: string) => ({
    letter: /\p{L}/u.test(password),
    number: /\p{Nd}/u.test(password),
    special: /[\p{P}$+=]/u.test(password),
    length: password.length >= FIELD_LIMITS.password.minLength,
});