// src/types/events.d.ts
export type ChangeDetail = { isOpen: boolean };

declare global {
    interface HTMLElementEventMap {
        'modal:change': CustomEvent<ChangeDetail>;
        'sidebar:change': CustomEvent<ChangeDetail>;
    }
    interface WindowEventMap {
        [key: `modal:change:${string}`]: CustomEvent<ChangeDetail>;
        [key: `sidebar:change:${string}`]: CustomEvent<ChangeDetail>;
    }
};