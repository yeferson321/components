import { getFeedback } from '../../behaviors/feedback';

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

export const createCaptcha = (root: CaptchaElement, onReset: () => void, statusSelector = '[data-feedback="captcha"], [data-captcha-status]') => {
    const feedback = getFeedback(root.querySelector<HTMLElement>(statusSelector));
    feedback?.show(root.dataset.captcha ?? 'idle'); // el Feedback nace vacío: muestra el estado inicial

    const setState = (state: CaptchaState) => {
        if (root.dataset.captcha === state) return;

        root.dataset.captcha = state;
        feedback?.show(state);
        root.dispatchEvent(new CustomEvent<CaptchaChangeDetail>('captcha:change', { bubbles: true, detail: { state } }));
    };

    root.getState = () => root.dataset.captcha as CaptchaState;
    root.reset = () => {
        onReset();
        setState('idle');
    };

    root.addEventListener('captcha:reset', () => root.reset?.());
    if (root.id) window.addEventListener(`captcha:reset:${root.id}`, () => root.reset?.());

    return { setState };
};