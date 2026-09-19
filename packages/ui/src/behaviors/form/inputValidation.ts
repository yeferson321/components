
import type { ValidationContext, ValidationResult, Validator, ValidatorKey, NameCode, EmailCode, CurrentPasswordCode, NewPasswordCode, CheckboxCode } from './types';
import { NAME_PATTERN, REPEATED_CHARS_PATTERN, LETTER_PATTERN, NUMBER_PATTERN, SPECIAL_PATTERN, WHITESPACE_PATTERN } from './rules';
import { normalize } from './rules';

const makeResult = <Code extends string>(result: ValidationResult<Code>) => result;

export const validateName = ({ value, properties, validity }: ValidationContext): ValidationResult<NameCode> => {
    const name = normalize(value);

    if (!name) {
        return properties.required ? makeResult({ code: "REQUIRED", state: "invalid" }) : makeResult({ code: "", state: "" });
    }

    if (!NAME_PATTERN.test(name)) return makeResult({ code: "INVALID_CHARS", state: "invalid" });

    if (/ {2,}/.test(name)) return makeResult({ code: "SPACES", state: "invalid" });

    if (name.length < properties.minLength) return makeResult({ code: "TOO_SHORT", state: "invalid" });

    if (name.length > properties.maxLength) return makeResult({ code: "TOO_LONG", state: "invalid" });

    if (!validity.valid) return makeResult({ code: "INVALID", state: "invalid" });

    return makeResult({ code: "", state: "valid" });
};

export const validateEmail = ({ value, properties, validity }: ValidationContext): ValidationResult<EmailCode> => {
    const email = normalize(value);

    if (!email) {
        return properties.required ? makeResult({ code: "REQUIRED", state: "invalid" }) : makeResult({ code: "", state: "" });
    }

    if (WHITESPACE_PATTERN.test(email)) return makeResult({ code: "NO_SPACES", state: "invalid" });

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

    if (WHITESPACE_PATTERN.test(password)) return makeResult({ code: "NO_SPACES", state: "invalid" });

    if (password.length < properties.minLength) return makeResult({ code: "", state: "" });

    if (password.length > properties.maxLength) return makeResult({ code: "TOO_LONG", state: "invalid" });

    if (!validity.valid) return makeResult({ code: "INVALID", state: "invalid" });

    return makeResult({ code: "", state: "valid" });
};

export const validateNewPassword = ({ value, properties, validity }: ValidationContext): ValidationResult<NewPasswordCode> => {
    const password = normalize(value);

    if (!password) {
        return properties.required
            ? makeResult({
                  code: "REQUIRED",
                  state: "invalid",
                  requirements: { length: false, letter: false, number: false, special: false },
              })
            : makeResult({ code: "", state: "", requirements: {} });
    }

    const requirements = {
        letter: LETTER_PATTERN.test(password),
        number: NUMBER_PATTERN.test(password),
        special: SPECIAL_PATTERN.test(password),
        length: password.length >= properties.minLength,
    };

    if (WHITESPACE_PATTERN.test(password)) return makeResult({ code: "NO_SPACES", state: "invalid", requirements });

    if (REPEATED_CHARS_PATTERN.test(password)) return makeResult({ code: "REPEATED_CHARACTERS", state: "invalid", requirements });

    if (!requirements.letter || !requirements.number || !requirements.special || !requirements.length) return makeResult({ code: "", state: "", requirements });

    if (password.length > properties.maxLength) return makeResult({ code: "", state: "", requirements });

    if (!validity.valid) return makeResult({ code: "INVALID", state: "invalid", requirements });

    return makeResult({ code: "", state: "valid", requirements });
};

export const validateCheckbox = ({ properties, validity }: ValidationContext): ValidationResult<CheckboxCode> => {
    if (!properties.required) return makeResult({ code: "", state: "" });

    if (!validity.valid) return makeResult({ code: "REQUIRED", state: "invalid" });

    return makeResult({ code: "", state: "valid" });
};

export const validators: Record<ValidatorKey, Validator> = {
    name: validateName,
    email: validateEmail,
    "current-password": validateCurrentPassword,
    "new-password": validateNewPassword,
    checkbox: validateCheckbox,
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
