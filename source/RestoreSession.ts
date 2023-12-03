import { assertNotNull } from "./assert.js";
import { getNativeMethod, getNativePrototypeMethod } from "./method.js";
import { createSafeWindow } from "./window.js";
import { EntryPoints } from "./types.js";

/**
 * A restore session handler that assists with
 * restoring overridden functions
 */
export class RestoreSession {
    private __cache: Map<string, Function> = new Map();
    protected _currentWindow: Window;
    protected _safeWindow: Window | null = null;

    constructor(win: Window = window) {
        this._currentWindow = win;
    }

    /**
     * Get the native version of a global method
     * @param methodPath The global method path
     * @returns The method, in its native form
     * @example
     *  const dce = session.getNativeMethod("document.createElement");
     *  const div = dce("div");
     */
    getNativeMethod<T extends () => unknown>(methodPath: string): T {
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

    /**
     * Get the native version of an instance method
     *  for a global prototype (eg Element)
     * @param target The target instance (eg. a `HTMLElement` instance)
     * @param methodName The name of the method to fetch (eg. `appendChild`)
     * @param methodPath The full path of the prototype
     *  (eg. `window.Element.prototype.appendChild`)
     * @returns The processed method
     * @example
     *  const targetAppend = session.getNativePrototypeMethod(
     *      targetElement,
     *      "appendChild",
     *      "window.Element.prototype.appendChild"
     *  );
     *  targetAppend(someChildElement);
     */
    getNativePrototypeMethod<T extends NonNullable<Object>, M extends keyof T>(
        target: T,
        methodName: M,
        methodPath: string
    ) {
        assertNotNull(this._safeWindow, "RestoreSession not initialised");
        return getNativePrototypeMethod(target, methodName, methodPath, this.getEntryPoints().safe);
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

/**
 * Create a new Restore Session
 * @param win Optional target window
 * @returns A RestoreSession instance
 */
export async function createSession(win: Window = window): Promise<RestoreSession> {
    const session = new RestoreSession(win);
    await session.init();
    return session;
}
