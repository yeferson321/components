export type CaptchaState = 'idle' | 'verifying' | 'verified' | 'error';

export type CaptchaChangeDetail = { state: CaptchaState };

// API pública del captcha, colgada del propio elemento raíz (.captcha).
export type CaptchaElement = HTMLElement & {
    getState?: () => CaptchaState;
    reset?: () => void;
};

declare global {
    interface HTMLElementEventMap {
        'captcha:change': CustomEvent<CaptchaChangeDetail>;
    }
}

// Lógica común a todos los captchas: estado visual en data-captcha, mensaje de estado
// (parseado de data-messages, mismo patrón que el resto de la librería), evento
// captcha:change (burbujea) y la API getState()/reset(). No sabe nada de formularios.
export const createCaptcha = (root: CaptchaElement, onReset: () => void, statusSelector = '[data-captcha-status]') => {
    const status = root.querySelector<HTMLElement>(statusSelector);
    const messages: Record<string, string> = JSON.parse(status?.dataset.messages ?? '{}');
    if (status) delete status.dataset.messages;

    const setState = (state: CaptchaState) => {
        if (root.dataset.captcha === state) return;

        root.dataset.captcha = state;
        if (status) status.textContent = messages[state] ?? '';
        root.dispatchEvent(new CustomEvent<CaptchaChangeDetail>('captcha:change', { bubbles: true, detail: { state } }));
    };

    root.getState = () => root.dataset.captcha as CaptchaState;
    root.reset = () => {
        onReset();
        setState('idle');
    };

    // Reinicio por evento, igual que toggle-button:deactivate:<id> o modal:hide:<id>:
    // - window.dispatchEvent(new CustomEvent('captcha:reset:mi-id'))  (necesita que el captcha tenga id)
    // - captchaElement.dispatchEvent(new CustomEvent('captcha:reset'))
    root.addEventListener('captcha:reset', () => root.reset?.());
    if (root.id) window.addEventListener(`captcha:reset:${root.id}`, () => root.reset?.());

    return { setState };
};