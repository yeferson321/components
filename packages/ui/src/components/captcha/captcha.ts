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
export const createCaptcha = (root: CaptchaElement, onReset: () => void) => {
    const status = root.querySelector<HTMLElement>('[data-captcha-status]');
    const messages: Record<string, string> = JSON.parse(status?.dataset.messages ?? '{}');
    if (status) delete status.dataset.messages;

    const setState = (state: CaptchaState) => {
        root.dataset.captcha = state;
        if (status) status.textContent = messages[state] ?? '';
        root.dispatchEvent(new CustomEvent<CaptchaChangeDetail>('captcha:change', { bubbles: true, detail: { state } }));
    };

    root.getState = () => root.dataset.captcha as CaptchaState;
    root.reset = () => {
        onReset();
        setState('idle');
    };

    return { setState };
};