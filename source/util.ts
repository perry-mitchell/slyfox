import { BindTarget, EntryPoints } from "./types";
import { getSafeWindow } from "./window";

const OBJ_HOST_CTOR_REXP = /^\[object .+?Constructor\]$/;
const RF_BOUND_FN_REXP = /__restorefunc_bound_method__/;

export function getMethodAtPath(path: string, entryPoints: EntryPoints, bindTarget: BindTarget) {
    let previousItem: string | null = null,
        pathParts = path.split("."),
        entryPoint = pathParts.shift();
    if (!entryPoint || entryPoints.hasOwnProperty(entryPoint) !== true) {
        throw new Error("Invalid path: " + path);
    }
    pathParts.unshift(entryPoints[entryPoint]);
    var outMethod = pathParts.reduce(function(previous, current) {
        if (previous && previous[current]) {
            previousItem = previous;
            return previous[current];
        }
        return undefined;
    });
    bindTarget = bindTarget || previousItem;
    return outMethod && bindTarget ?
        {
            method: outMethod,
            context: bindTarget
        } :  null;
}

async function getNativeToStringRexp(): Promise<RegExp> {
    const safeWindow = await getSafeWindow();
    const toString = safeWindow["Object"].prototype.toString;
    return new RegExp('^' +
        // Coerce `Object#toString` to a string
        String(toString)
            // Escape any special regexp characters
            .replace(/[.*+?^${}()|[\]\/\\]/g, "\\$&")
            // Replace mentions of `toString` with `.*?` to keep the template generic.
            // Replace thing like `for ...` to support environments like Rhino which add extra info
            // such as method arity.
            .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    );
}

function isAppendReady(): boolean {
    return !!(document.body && document.body.appendChild);
}

function isDOMReady(): boolean {
    if (document.readyState && ["loading", "interactive", "complete"].indexOf(document.readyState) >= 0) {
        return (["interactive", "complete"].indexOf(document.readyState) >= 0) && isAppendReady();
    }
    return isAppendReady();
}

export async function isNative(value: NonNullable<Object> | Function): Promise<boolean> {
    const safeWindow = await getSafeWindow();
    const reNative = await getNativeToStringRexp();
    var type = typeof value;
    const fnStr = type === "function" ? safeWindow["Function"].prototype.toString.call(value) : null;
    return fnStr ?
        // Use `Function#toString` to bypass the value's own `toString` method
        // and avoid being faked out.
        RF_BOUND_FN_REXP.test(fnStr) || reNative.test(fnStr) :
        // Fallback to a host object check because some environments will represent
        // things like typed arrays as DOM methods which may not conform to the
        // normal native pattern.
        (value && type == 'object' && OBJ_HOST_CTOR_REXP.test(toString.call(value))) || false;
}

export async function waitDOMReady(signal?: AbortSignal): Promise<void> {
    if (isDOMReady()) {
        return;
    }
    return new Promise(resolve => {
        if (signal?.aborted) return resolve();
        const handleReady = () => {
            document.removeEventListener("DOMContentLoaded", handleReady, false);
            resolve();
        };
        document.addEventListener("DOMContentLoaded", handleReady, false);
        signal?.addEventListener("abort", () => handleReady());
    });
}
