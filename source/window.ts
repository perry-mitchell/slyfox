let __safeWindow: Window | null = null,
    __safeWindowPromise: Promise<Window> | null = null;

async function createSafeWindow(): Promise<Window> {
    if (__safeWindow) return __safeWindow;
    const frame = document.createElement("iframe");
    frame.setAttribute("style", "display: none; visibility: hidden;");
    return new Promise<Window>((resolve, reject) => {
        if (frame.contentWindow?.document?.readyState === "complete") {
            return resolve(frame.contentWindow);
        }
        frame.addEventListener("load", () => {
            if (!frame.contentWindow) {
                return reject(new Error("IFrame loaded but no window available"));
            }
            resolve(frame.contentWindow)
        });
        document.body.appendChild(frame);
    });
}

export async function getSafeWindow(): Promise<Window> {
    if (!__safeWindowPromise) {
        __safeWindowPromise = createSafeWindow();
    }
    return __safeWindowPromise;
}