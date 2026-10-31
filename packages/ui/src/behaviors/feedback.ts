export type FeedbackController = {
    get: (code: string) => string | undefined;
    show: (code: string) => void;
    set: (text: string) => void;
    clear: () => void;
};

type FeedbackElement = HTMLElement & { feedback?: FeedbackController };

export const getFeedback = (element: HTMLElement | null): FeedbackController | null => {
    if (!element) return null;

    const host = element as FeedbackElement;
    if (host.feedback) return host.feedback;

    const messages: Record<string, string> = JSON.parse(element.dataset.messages ?? '{}');
    delete element.dataset.messages;

    let active = ''; // cache: no reescribe el DOM si el code no cambió

    const write = (text: string, key: string) => {
        element.textContent = text;
        active = key;
    };

    return (host.feedback = {
        get: (code) => messages[code],
        show: (code) => { if (code !== active) write(messages[code] ?? '', code); },
        set: (text) => write(text, '__override__'), // texto ya resuelto: invalida el cache
        clear: () => write('', ''),
    });
};