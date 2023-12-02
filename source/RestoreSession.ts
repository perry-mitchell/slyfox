import { assertNotNull } from "./assert.js";
import { getNativeMethod } from "./method.js";
import { createSafeWindow } from "./window.js";
import { EntryPoints } from "./types.js";

export class RestoreSession {
    protected _currentWindow: Window;
    protected _safeWindow: Window | null = null;

    constructor(win: Window = window) {
        this._currentWindow = win;
    }

    getNativeMethod<T extends () => void>(methodPath: string): T {
        assertNotNull(this._safeWindow, "RestoreSession not initialised");
        return getNativeMethod<T>(methodPath, this.getEntryPoints(), this._safeWindow);
    }

    async init(): Promise<void> {
        if (this._safeWindow) return;
        this._safeWindow = await createSafeWindow(this._currentWindow);
    }

    protected getEntryPoints(): EntryPoints {
        assertNotNull(this._safeWindow, "RestoreSession not initialised");
        return {
            top: {
                window: this._currentWindow,
                document: this._currentWindow.document
            },
            safe: {
                window: this._safeWindow,
                document: this._safeWindow?.document
            }
        };
    }
}

export async function createSession(win: Window = window): Promise<RestoreSession> {
    const session = new RestoreSession(win);
    await session.init();
    return session;
}
