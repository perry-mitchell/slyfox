import { isNativeMethod } from "./method.js";

const CHILD_BEARING_ELEMENTS = "a,aside,b,div,footer,header,i,p,strong,span";
const INSERTION_METHODS: Array<[
    (win: Window) => boolean,
    (win: Window) => HTMLIFrameElement
]> = [
    [
        (win: Window) => isNativeMethod(win.document.createElement, win),
        (win: Window) => win.document.createElement("iframe")
    ],
    [
        (win: Window) => isNativeMethod(win.document.body.insertAdjacentHTML, win),
        (win: Window) => {
            const randomID = getRandomID();
            win.document.body.insertAdjacentHTML(
                "afterbegin",
                `<iframe id=\"${randomID}\"></iframe>`
            );
            return win.document.getElementById(randomID) as HTMLIFrameElement;
        }
    ],
    [
        (win: Window) => {
            const anyEl = win.document.body.querySelector(CHILD_BEARING_ELEMENTS);
            if (!anyEl) return false;
            return typeof anyEl.innerHTML === "string";
        },
        (win: Window) => {
            const bodyEls = [...win.document.body.children].reverse();
            const tags = CHILD_BEARING_ELEMENTS.split(",");
            const randomID = getRandomID();
            const el = bodyEls.find(sub => tags.includes(sub.tagName.toLowerCase()));
            if (!el) throw new Error("No element found for innerHTML insertion");
            el.innerHTML = `${el.innerHTML}<iframe id=\"${randomID}\"></iframe>`;
            return win.document.getElementById(randomID) as HTMLIFrameElement;
        }
    ]
];

export async function createSafeWindow(win: Window): Promise<Window> {
    return new Promise<Window>((resolve, reject) => {
        const frame = tryInsertIframe(win);
        frame.setAttribute("style", "display: none; visibility: hidden;");
        if (frame.contentWindow?.document?.readyState === "complete") {
            return resolve(frame.contentWindow);
        }
        frame.addEventListener("load", () => {
            if (!frame.contentWindow) {
                return reject(new Error("IFrame loaded but no window available"));
            }
            resolve(frame.contentWindow)
        });
    });
}

function getRandomID(): string {
    return `sf_${Date.now()}_${Math.floor(Math.random() * 999999)}`;
}

function tryInsertIframe(win: Window): HTMLIFrameElement {
    const validMethod = INSERTION_METHODS.find(
        ([check]) => check(win)
    );
    if (!validMethod) {
        throw new Error("Found no reliable iframe insertion method");
    }
    return validMethod[1](win);
}
