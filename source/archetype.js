(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define("archetype", factory);
	} else {
		root.archetype = factory();
	}
}(window, function () {

	"use strict";

	//
	// Initialisation
	//

	var _frame = (function prepareIframe() {
			var frame = document.createElement("iframe");
			frame.style.display = "none";
			frame.style.visibility = "hidden";
			frame.setAttribute("owner", "archetype");
			document.body.appendChild(frame);
			return frame;
		})(),
		_safeWindow = _frame.contentWindow;

	var fnToString = _safeWindow.Function.prototype.toString,
		toString = _safeWindow.Object.prototype.toString,
		reHostCtor = /^\[object .+?Constructor\]$/,
		reNative = new RegExp('^' +
			// Coerce `Object#toString` to a string
			String(toString)
				// Escape any special regexp characters
				.replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&')
				// Replace mentions of `toString` with `.*?` to keep the template generic.
				// Replace thing like `for ...` to support environments like Rhino which add extra info
				// such as method arity.
				.replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
		),
		reBound = /__archetype_bound_method__/;

	var _entryPoints = {
		top: {
			window: window,
			document: window.document
		},
		safe: {
			window: _safeWindow,
			document: _safeWindow.document
		}
	};

	//
	// Toolkit
	//

	function bindMethod(method, context) {
		return function __archetype_bound_method__() {
			return method.apply(context, arguments);
		};
	}

	function getMethodAtPath(path, entryPoints, bindTarget) {
		entryPoints = entryPoints || _entryPoints.top;
		var currentObj,
			previousItem,
			pathParts = path.split("."),
			entryPoint = pathParts.shift();
		if (entryPoints.hasOwnProperty(entryPoint) !== true) {
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
			} : undefined;
	}

	/**
	 * Check if a method is native
	 * Taken from: https://davidwalsh.name/detect-native-function
	 */
	function isNative(value) {
		var type = typeof value,
			fnStr = type === "function" ? fnToString.call(value) : null;
		return fnStr ?
			// Use `Function#toString` to bypass the value's own `toString` method
			// and avoid being faked out.
			reBound.test(fnStr) || reNative.test(fnStr) :
			// Fallback to a host object check because some environments will represent
			// things like typed arrays as DOM methods which may not conform to the
			// normal native pattern.
			(value && type == 'object' && reHostCtor.test(toString.call(value))) || false;
	}

	function pathIsNative(path, entryPoints) {
		var currentObj = getMethodAtPath(path, entryPoints);
		return currentObj ? isNative(currentObj.method) : false;
	}

	function setMethodAtPath(path, method) {
		var pathParts = path.split("."),
			entryPoint = pathParts.shift(),
			currentObj,
			nextPart;
		if (_entryPoints.top.hasOwnProperty(entryPoint) !== true) {
			throw new Error("Invalid path: " + path);
		} else if (pathParts.length < 1) {
			throw new Error("Invalid path - not specific enough: " + path);
		}
		currentObj = _entryPoints.top[entryPoint];
		while (pathParts.length > 1) {
			nextPart = pathParts.shift();
			if (currentObj[nextPart]) {
				currentObj = currentObj[nextPart];
			} else {
				throw new Error("Unknown method: " + path);
			}
		}
		currentObj[pathParts.shift()] = method;
	}

	//
	// Library
	//

	var lib = {

		/**
		 * Get a native method at a specific path. If the method found at the top level is not
		 * native, a native version is taken from the safe window.
		 * @param {String} path The method path (eg. window.setTimeout)
		 * @param {HTMLElement} bindContext Element where to bind the native method
		 * @returns {Function}
		 */
		getNativeMethod: function(path, bindContext) {
			var obj = getMethodAtPath(path);
			bindContext = bindContext || obj.context;
			if (!obj) {
				throw new Error("Unknown method (top window): " + path);
			} else if (obj && !lib.isNative(obj.method)) {
				// call again, providing the new window (safe) and the top-window context to bind
				obj = getMethodAtPath(path, _entryPoints.safe, obj.context);
				// try again
				if (!obj) {
					throw new Error("Unknown method (safe window): " + path);
				} else if (obj && !lib.isNative(obj.method)) {
					throw new Error("Failed finding a native method for: " + path);
				}
			}
			return bindMethod(obj.method, bindContext);
		},

		/**
		 * Check if a path or method is native. If the item provided is a string, the top window
		 * is checked - if the item provided is a function, it alone is checked.
		 * @param {String|Function} pathOrMethod The path (string) or function to check
		 * @returns {Boolean}
		 */
		isNative: function(pathOrMethod) {
			return typeof pathOrMethod === "string" ?
				pathIsNative(pathOrMethod) :
				isNative(pathOrMethod);
		},

		/**
		 * Patch a window method with a specific path
		 * @param {String} path The method path (eg. window.document.querySelector)
		 */
		patchMethod: function(path) {
			setMethodAtPath(path, lib.getNativeMethod(path));
		}

	};

	return lib;

}));
