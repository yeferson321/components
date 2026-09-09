type FieldProperties = {
    minLength: number;
    maxLength: number;
    required: boolean;
};

export type ValidationContext<Props = FieldProperties> = {
    value: string;
    validity: ValidityState;
    properties: Props;
};

export type FieldState = "valid" | "invalid" | "error" | "";

export type PasswordRequirement = "letter" | "number" | "special" | "length";

export type PasswordRequirements = Partial<Record<PasswordRequirement, boolean>>;

export type ValidationResult<Code extends string = string> = {
    code: Code | "";
    state: FieldState
    requirements?: PasswordRequirements;
};

export type Validator = (ctx: ValidationContext) => ValidationResult;

export type EmailCode = "REQUIRED" | "NO_SPACES" | "MISSING_AT" | "MISSING_LOCAL_PART" | "MISSING_DOMAIN" | "TOO_SHORT" | "TOO_LONG" | "INVALID" | "";
export type NameCode = "REQUIRED" | "INVALID_CHARS" | "SPACES" | "TOO_SHORT" | "TOO_LONG" | "INVALID" | "";
export type CurrentPasswordCode = "REQUIRED" | "NO_SPACES" | "TOO_SHORT" | "TOO_LONG" | "INVALID" | "";
export type NewPasswordCode = "REQUIRED" | "NO_SPACES" | "REPEATED_CHARACTERS" | "MISSING_LETTER" | "MISSING_NUMBER" | "MISSING_SPECIAL_CHAR" | "TOO_SHORT" | "TOO_LONG" | "INVALID" | "";