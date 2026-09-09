import type { ValidationContext, ValidationResult, Validator, NameCode, EmailCode, CurrentPasswordCode, NewPasswordCode } from './types';
import { normalize, NAME_PATTERN, hasWhitespace, hasDoubleSpaces, hasRepeatedChars, getPasswordRequirements } from './rules';

const makeResult = <Code extends string>(result: ValidationResult<Code>) => result;

export const validateName = ({ value, properties, validity }: ValidationContext): ValidationResult<NameCode> => {
    const name = normalize(value);

    if (!name) {
        return properties.required
            ? makeResult({ code: "REQUIRED", state: "invalid" })
            : makeResult({ code: "", state: "" });
    }

    if (!NAME_PATTERN.test(name)) return makeResult({ code: "INVALID_CHARS", state: "invalid" });
    if (hasDoubleSpaces(name)) return makeResult({ code: "SPACES", state: "invalid" });

    if (name.length < properties.minLength) return makeResult({ code: "TOO_SHORT", state: "invalid" });
    if (name.length > properties.maxLength) return makeResult({ code: "TOO_LONG", state: "invalid" });
    if (!validity.valid) return makeResult({ code: "INVALID", state: "invalid" });

    return makeResult({ code: "", state: "valid" });
};

export const validateEmail = ({ value, properties, validity }: ValidationContext): ValidationResult<EmailCode> => {
    const email = normalize(value);

    if (!email) {
        return properties.required
            ? makeResult({ code: "REQUIRED", state: "invalid" })
            : makeResult({ code: "", state: "" });
    }

    if (hasWhitespace(email)) return makeResult({ code: "NO_SPACES", state: "invalid" });
    if (!email.includes("@")) return makeResult({ code: "MISSING_AT", state: "invalid" });

    const [username, domain] = email.split("@");

    if (!username) return makeResult({ code: "MISSING_LOCAL_PART", state: "invalid" });
    if (!domain) return makeResult({ code: "MISSING_DOMAIN", state: "invalid" });
    if (email.length < properties.minLength) return makeResult({ code: "TOO_SHORT", state: "invalid" });
    if (email.length > properties.maxLength) return makeResult({ code: "TOO_LONG", state: "invalid" });
    if (!validity.valid) return makeResult({ code: "INVALID", state: "invalid" });

    return makeResult({ code: "", state: "valid" });
};

export const validateCurrentPassword = ({ value, properties, validity }: ValidationContext): ValidationResult<CurrentPasswordCode> => {
    const password = normalize(value);

    if (!password) {
        return properties.required
            ? makeResult({ code: "REQUIRED", state: "invalid" })
            : makeResult({ code: "", state: "" });
    }

    if (/\p{White_Space}/u.test(password)) return makeResult({ code: "NO_SPACES", state: "invalid" });

    if (password.length < properties.minLength) return makeResult({ code: "", state: "" });
    if (password.length > properties.maxLength) return makeResult({ code: "TOO_LONG", state: "invalid" });

    if (!validity.valid) return makeResult({ code: "INVALID", state: "invalid" });

    return makeResult({ code: "", state: "valid" });
};

export const validateNewPassword = ({ value, properties, validity }: ValidationContext): ValidationResult<NewPasswordCode> => {
    const password = normalize(value);

    if (!password) {
        return properties.required
            ? makeResult({ code: "REQUIRED", state: "invalid", requirements: { length: false, letter: false, number: false, special: false }})
            : makeResult({ code: "", state: "", requirements: {} });
    }

    const requirements = getPasswordRequirements(password);

    if (hasWhitespace(password)) return makeResult({ code: "NO_SPACES", state: "invalid", requirements });
    if (hasRepeatedChars(password)) return makeResult({ code: "REPEATED_CHARACTERS", state: "invalid", requirements });
    if (!requirements.letter) return makeResult({ code: "", state: "", requirements });
    if (!requirements.number) return makeResult({ code: "", state: "", requirements });
    if (!requirements.special) return makeResult({ code: "", state: "", requirements });
    if (!requirements.length) return makeResult({ code: "", state: "", requirements });
    if (password.length > properties.maxLength) return makeResult({ code: "", state: "", requirements });
    if (!validity.valid) return makeResult({ code: "INVALID", state: "invalid", requirements });

    return makeResult({ code: "", state: "valid", requirements });
};

export const validators: Record<string, Validator> = {
    "text:name": validateName,
    "email:email": validateEmail,
    "password:current-password": validateCurrentPassword,
    "password:new-password": validateNewPassword,
};


// export const validateUserName = ({ value, validity, properties }: ValidationContext): ValidationResult => {
//     const username = normalize(value)

//     const result = validateLengt(username, properties);
//     if (result) return result;

//     if (!/^[\p{L}0-9_.]+$/u.test(username)) return { state: "invalid", code: "INVALID_CHARS" };

//     if (/\p{White_Space}/u.test(username)) return { state: "invalid", code: "NO_SPACES" };

//     if (!validity.valid) return { state: "invalid", code: "INVALID" };

//     if (/\.{2,}/.test(username)) return { state: "invalid", code: "CONSECUTIVE_DOTS" };
//     if (/^\.|\.$/.test(username)) return { state: "invalid", code: "INVALID_DOTS_POSITION" };

//     return { state: "valid", code: "" };
// };
    // if (!/^[\p{L}\p{White_Space}'’\-]+$/u.test(name)) return makeResult({ code: "INVALID_CHARS", state: "invalid" });
