import type { FieldState } from './types';
import { debounce } from '#/utils/limitExecution';
import { validators } from './inputValidation';
import { normalize } from './rules';

type FieldController = {
    fieldElement: HTMLDivElement;
    inputElement: HTMLInputElement;
    validate: () => FieldState;
    getState: () => FieldState;
};

const createMessageHandler = (feedbackElement: HTMLElement | null) => {
    const rawMessages = feedbackElement?.dataset.messages;
    const messages: Record<string, string> = rawMessages ? JSON.parse(rawMessages) : {};

    if (feedbackElement) delete feedbackElement.dataset.messages;

    let activeCode = "";

    return (code: string) => {
        if (!feedbackElement || code === activeCode) return;

        feedbackElement.textContent = messages[code] ?? "";
        activeCode = code;
    };
};

const setupField = (fieldElement: HTMLDivElement, onValidated: () => void): FieldController | null => {
    const inputElement = fieldElement.querySelector<HTMLInputElement>("[data-field-input]");
    if (!inputElement) return null;

    const { type, autocomplete, minLength, maxLength, required } = inputElement;
    const validator = validators[`${type}:${autocomplete}`];

    if (!validator) {
        console.warn(`No hay validador registrado para "${type}:${autocomplete}"`);
        return null;
    }

    const properties = { minLength, maxLength, required };
    const showMessage = createMessageHandler(fieldElement.querySelector<HTMLElement>("[data-field-feedback]"));

    const validate = (): FieldState => {
        const { code, state, requirements } = validator({ value: inputElement.value, validity: inputElement.validity, properties });

        fieldElement.dataset.state = state;
        showMessage(code);

        if (requirements) {
            for (const [requirement, isValid] of Object.entries(requirements)) {
                fieldElement.setAttribute(`data-req-${requirement}`, String(isValid));
            }
        }

        return state;
    };

    inputElement.addEventListener("input", debounce(() => {
        validate();
        onValidated(); // recalcula el estado del botón una vez que el campo terminó de validarse
    }, 400));

    return { fieldElement, inputElement, validate, getState: () => (fieldElement.dataset.state ?? "") as FieldState };
};

export const setupForm = <T extends Record<string, string>>(form: HTMLFormElement, onValidSubmit: (data: T) => void | Promise<void>) => {
    const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');

    let isSubmitting = false;

    const updateSubmitState = () => {
        if (!submitButton) return;

        const canSubmit = fields.every((field) => {
            if (field.fieldElement.hidden) return true;

            const state = field.getState();
            return field.inputElement.required ? state === "valid" : state !== "invalid";
        });

        submitButton.disabled = !canSubmit || isSubmitting;
    };

    const fields = Array.from(form.querySelectorAll<HTMLDivElement>(".form-field"))
        .map((fieldElement) => setupField(fieldElement, updateSubmitState))
        .filter((f): f is FieldController => f !== null);

    // si algún campo quedó en "error" (por el servidor), la primera edición revalida todo
    form.addEventListener("input", () => {
        if (!fields.some((field) => field.getState() === "error")) return;

        fields.forEach((field) => field.validate());
        updateSubmitState();
    });

    const setServerError = () => {
        fields.forEach((field) => {
            if (!field.fieldElement.hidden) field.fieldElement.dataset.state = "error";
        });
        updateSubmitState();
    };

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const states = fields.filter((field) => !field.fieldElement.hidden).map((field) => field.validate());
        const isValid = states.every((state) => state === "valid");

        if (!isValid) return;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries()) as Record<string, FormDataEntryValue>;

        for (const key of Object.keys(data)) {
            const value = data[key];
            if (typeof value === "string") data[key] = normalize(value);
        }

        isSubmitting = true;
        updateSubmitState();

        try {
            await onValidSubmit(data as T);
        } finally {
            isSubmitting = false;
            updateSubmitState();
        }
    });

    return { setServerError };
};