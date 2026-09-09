export const limitExecution = (func: Function, time: number) => {
    // Stores the timestamp of the last function call.
    let lastCall = 0;

    return function (...args: any[]) {
        // Get the current timestamp.
        const now = Date.now();

        // Check if at least 220 milliseconds have passed since the last call.
        if (now - lastCall >= time) {
            // Update the last call time to the current timestamp.
            lastCall = now;
            // Execute the function with the provided arguments.
            func(...args);
        }
    };
};

export const debounce = (func: Function, time: number) => {
    let timeout: number;

    return function (...args: any[]) {
        clearTimeout(timeout);

        timeout = window.setTimeout(() => {
            func(...args);
        }, time);
    };
};