import type { FieldState, FormFieldElement } from './types';
import { normalize } from './rules';

// Mismo patrón que en FormField.astro: parsea el data-messages del feedback.
const parseMessages = (element: HTMLElement | null): Record<string, string> => {
    const rawMessages = element?.dataset.messages;
    const messages: Record<string, string> = rawMessages ? JSON.parse(rawMessages) : {};
    if (element) delete element.dataset.messages;
    return messages;
};

const isFieldOk = (field: FormFieldElement): boolean => {
    if (field.hidden) return true;
    const inputElement = field.querySelector<HTMLInputElement>("[data-field-input]");
    const state = (field.dataset.state ?? "") as FieldState;
    return inputElement?.required ? state === "valid" : state !== "invalid";
};

export const setupForm = <T extends Record<string, string>>(
    form: HTMLFormElement,
    onValidSubmit: (data: T) => void | Promise<void>
) => {
    const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const formFeedback = form.querySelector<HTMLElement>(`[data-feedback="form"]`);
    const formMessages = parseMessages(formFeedback);
    const fields = Array.from(form.querySelectorAll<FormFieldElement>(".form-field"));
    const findFieldByName = (name: string) =>
        fields.find((field) => field.querySelector<HTMLInputElement>("[data-field-input]")?.name === name);

    let isSubmitting = false;
    // "generic": un mismo code para todos los campos (revalida todo al primer input).
    // "targeted": code por campo (revalida solo el campo que se edita).
    let fieldsErrorMode: "generic" | "targeted" | null = null;

    const updateSubmitState = () => {
        if (submitButton) submitButton.disabled = !fields.every(isFieldOk) || isSubmitting;
    };

    const resolveFormMessage = (code: string): string => {
        if (formMessages[code] === undefined) console.warn(`No hay traducción para el code "${code}"`);
        return formMessages[code] ?? "";
    };

    // Cada FormField dispara esto al validarse (debounce propio o forzado desde acá).
    form.addEventListener("field:validated", updateSubmitState);

    form.addEventListener("input", (event) => {
        if (fieldsErrorMode === "generic") {
            if (fields.some((field) => field.dataset.state === "error")) {
                fields.forEach((field) => field.validate?.());
            }
        } else if (fieldsErrorMode === "targeted") {
            const field = (event.target as HTMLElement | null)?.closest<FormFieldElement>(".form-field");
            if (field?.dataset.state === "error") field.validate?.();
        }

        if (formFeedback?.dataset.state === "invalid") {
            formFeedback.textContent = "";
            formFeedback.dataset.state = "valid";
        }
    });

    // Error NO atado a un campo puntual (ej. "hubo un problema, intente de nuevo").
    const setFormError = (code: string) => {
        if (formFeedback) {
            formFeedback.textContent = resolveFormMessage(code);
            formFeedback.dataset.state = "invalid";
        }
        updateSubmitState();
    };

    // string: mismo code para todos los campos (cae a translations.form.error).
    // { [name]: code }: apunta a campos puntuales — cada uno resuelve primero
    // contra su propio diccionario y, si no está, contra translations.form.error.
    const setFieldsError = (errors: string | Record<string, string>) => {
        if (typeof errors === "string") {
            fieldsErrorMode = "generic";
            const fallback = resolveFormMessage(errors);
            fields.forEach((field) => !field.hidden && field.setError?.(errors, fallback));
        } else {
            fieldsErrorMode = "targeted";
            for (const [name, code] of Object.entries(errors)) {
                const field = findFieldByName(name);
                if (!field) {
                    console.warn(`No se encontró un campo con name="${name}"`);
                    continue;
                }
                if (!field.hidden) field.setError?.(code, formMessages[code]);
            }
        }
        updateSubmitState();
    };

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        fields.filter((field) => !field.hidden).forEach((field) => field.validate?.());
        if (!fields.every(isFieldOk)) return;

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

    updateSubmitState();

    return { setFormError, setFieldsError };
};