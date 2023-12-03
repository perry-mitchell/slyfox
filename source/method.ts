import { BindTarget, EntryPoint, EntryPoints } from "./types.js";

const OBJ_HOST_CTOR_REXP = /^\[object .+?Constructor\]$/;
const RF_BOUND_FN_REXP = /__restorefunc_bound_method__/;

function bindMethod<T extends () => unknown>(method: T, context: BindTarget): T {
    return function __restorefunc_bound_method__(...args) {
        return method.apply(context, args);
    } as T;
}

function getMethodAtPath<T extends () => void>(
    path: string,
    entryPoint: EntryPoint,
    bindTarget: BindTarget | null = null
): {
    method: T;
    context: Object;
} {
    const pathParts = path.split(".");
    let lastContext: Object = entryPoint;
    const target: T = pathParts.reduce((output, nextPart) => {
        if (nextPart.trim().length <= 0) {
            throw new Error("Path cannot contain empty properties");
        } else if (!output[nextPart]) {
            throw new Error(`Cannot resolve path (${path}): Property not found: ${nextPart}`);
        }
        lastContext = output;
        return output[nextPart];
    }, lastContext);
    return {
        method: target,
        context: bindTarget ?? lastContext
    };
}

export function getNativeMethod<T extends () => unknown>(
    methodPath: string,
    entryPoints: EntryPoints,
    safeWindow: Window
): T {
    let obj = getMethodAtPath(methodPath, entryPoints.top);
    if (!obj) {
        throw new Error("Unknown method (top window): " + methodPath);
    } else if (obj && !isNative(obj.method, entryPoints.top, safeWindow)) {
        // call again, providing the new window (safe) and the top-window context to bind
        obj = getMethodAtPath(methodPath, entryPoints.safe, obj.context);
        // try again
        if (!obj) {
            throw new Error("Unknown method (safe window): " + methodPath);
        } else if (!isNative(obj.method, entryPoints.safe, safeWindow)) {
            throw new Error("Failed finding a native method for: " + methodPath);
        }
    }
    return bindMethod<T>(obj.method as T, obj.context);
}

export function getNativePrototypeMethod<T extends NonNullable<Object>, M extends keyof T>(
    target: T,
    methodName: M,
    methodPath: string,
    safeEntry: EntryPoint
): T[M] {
    const method = target[methodName] as () => unknown;
    if (isNativeMethod(method, safeEntry.window)) {
        return bindMethod(method, target) as T[M];
    }
    const safeMethod = getMethodAtPath(methodPath, safeEntry, target);
    if (!safeMethod) {
        throw new Error("Unknown method (safe window): " + methodPath);
    } else if (!isNativeMethod(safeMethod.method, safeEntry.window)) {
        throw new Error("Failed finding a native method prototype: " + methodPath);
    }
    return bindMethod(safeMethod.method, safeMethod.context) as T[M];
}

function getNativeToStringRexp(safeWindow: Window): RegExp {
    const toString = safeWindow["Object"].prototype.toString;
    return new RegExp(
        "^" +
            // Coerce `Object#toString` to a string
            String(toString)
                // Escape any special regexp characters
                .replace(/[.*+?^${}()|[\]\/\\]/g, "\\$&")
                // Replace mentions of `toString` with `.*?` to keep the template generic.
                // Replace thing like `for ...` to support environments like Rhino which add extra info
                // such as method arity.
                .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") +
            "$"
    );
}

function pathIsNative(methodPath: string, entryPoint: EntryPoint, safeWindow: Window) {
    const currentObj = getMethodAtPath(methodPath, entryPoint);
    return currentObj ? isNative(currentObj.method, entryPoint, safeWindow) : false;
}

function isNative(pathOrMethod: string | Function, entryPoint: EntryPoint, safeWindow: Window) {
    return typeof pathOrMethod === "string"
        ? pathIsNative(pathOrMethod, entryPoint, safeWindow)
        : isNativeMethod(pathOrMethod, safeWindow);
}

export function isNativeMethod(value: NonNullable<Object> | Function, safeWindow: Window): boolean {
    const reNative = getNativeToStringRexp(safeWindow);
    var type = typeof value;
    const fnStr =
        type === "function" ? safeWindow["Function"].prototype.toString.call(value) : null;
    return fnStr
        ? // Use `Function#toString` to bypass the value's own `toString` method
          // and avoid being faked out.
          RF_BOUND_FN_REXP.test(fnStr) || reNative.test(fnStr)
        : // Fallback to a host object check because some environments will represent
          // things like typed arrays as DOM methods which may not conform to the
          // normal native pattern.
          (value && type == "object" && OBJ_HOST_CTOR_REXP.test(toString.call(value))) || false;
}
