export const appendChildElement = (element: HTMLElement) => document.body.appendChild(element);
export const removeElement = (element: HTMLElement) => element.remove();

export const trapFocus = (element: HTMLElement, event: KeyboardEvent) => {
    const focusables = Array.from(
        element.querySelectorAll<HTMLElement>(':is(button, [href], input, select, textarea):not([disabled]):not([aria-hidden="true"])')
    ).filter((HTMLElement) => HTMLElement.offsetParent !== null);

    if (focusables.length === 0) return;

    const firstFocusable = focusables[0];
    const lastFocusable = focusables[focusables.length - 1];
    const boundary = event.shiftKey ? firstFocusable : lastFocusable;

    if (document.activeElement === boundary) {
        event.preventDefault();
        (event.shiftKey ? lastFocusable : firstFocusable).focus();
    }
};