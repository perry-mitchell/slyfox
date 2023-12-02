export async function createSafeWindow(): Promise<Window> {
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