import { assertNotNull } from "./assert.js";
import { getNativeMethod } from "./method.js";
import { createSafeWindow } from "./window.js";
import { EntryPoints } from "./types.js";

export class RestoreSession {
    private __cache: Map<string, Function> = new Map();
    protected _currentWindow: Window;
    protected _safeWindow: Window | null = null;

    constructor(win: Window = window) {
        this._currentWindow = win;
    }

    getNativeMethod<T extends () => void>(methodPath: string): T {
        assertNotNull(this._safeWindow, "RestoreSession not initialised");
        // Check cache
        if (this.__cache.has(methodPath)) {
            return this.__cache.get(methodPath) as T;
        }
        // Fetch method
        const method = getNativeMethod<T>(methodPath, this.getEntryPoints(), this._safeWindow);
        this.__cache.set(methodPath, method);
        return method;
    }

    async init(): Promise<void> {
        if (this._safeWindow) return;
        this._safeWindow = await createSafeWindow(this._currentWindow);
    }

    precacheMethods(methodPaths: Array<string>): void {
        assertNotNull(this._safeWindow, "RestoreSession not initialised");
        for (const methodPath of methodPaths) {
            if (this.__cache.has(methodPath)) continue;
            const method = getNativeMethod(methodPath, this.getEntryPoints(), this._safeWindow);
            this.__cache.set(methodPath, method);
        }
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
