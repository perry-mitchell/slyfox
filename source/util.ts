/**
 * Wait for the page's <body> to be ready
 * @param win Optional window reference
 */
export async function waitForBody(win: Window = window): Promise<void> {
    await new Promise<void>(resolve => {
        const { document: doc } = win;
        if (doc.body) {
            return resolve();
        }
        const cleanup = () => {
            doc.removeEventListener("DOMContentLoaded", cleanup);
            doc.removeEventListener("load", cleanup);
            resolve();
        };
        doc.addEventListener("DOMContentLoaded", cleanup);
        doc.addEventListener("load", cleanup);
    });
}
