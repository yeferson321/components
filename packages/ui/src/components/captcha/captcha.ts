export type CaptchaState = 'idle' | 'verifying' | 'verified' | 'error';

export type CaptchaChangeDetail = { state: CaptchaState };

// API pública del captcha, colgada del propio elemento raíz (.captcha).
export type CaptchaElement = HTMLElement & {
    getState?: () => CaptchaState;
    reset?: () => void;
};


export const createCaptcha = (captchaElement: CaptchaElement, onReset: () => void, statusSelector = '[data-captcha-status]') => {
    const statusElement = captchaElement.querySelector<HTMLElement>(statusSelector);
    const messages: Record<string, string> = JSON.parse(statusElement?.dataset.messages ?? '{}');
    if (statusElement) delete statusElement.dataset.messages;

    const setState = (state: CaptchaState) => {
        if (captchaElement.dataset.captcha === state) return;

        captchaElement.dataset.captcha = state;
        if (statusElement) statusElement.textContent = messages[state] ?? '';

        const detail = { state };
        captchaElement.dispatchEvent(new CustomEvent<CaptchaChangeDetail>('captcha:change', { bubbles: true, detail }));
        window.dispatchEvent(new CustomEvent<CaptchaChangeDetail>(`captcha:change:${captchaElement.id}`, { detail }));
    };

    captchaElement.getState = () => captchaElement.dataset.captcha as CaptchaState;
    
    captchaElement.reset = () => {
        onReset();
        setState('idle');
    };

    return { setState };
};