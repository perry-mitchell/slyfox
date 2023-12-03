(function () {
    window.stolenCalls = 0;

    [
        [document.createElement, document, "createElement", true],
        [document.body.appendChild, document.body, "appendChild", true],
        [Element.prototype.appendChild, Element.prototype, "appendChild", false]
    ].forEach(([fn, context, name, shouldBind]) => {
        const orig = shouldBind ? fn.bind(context) : fn;
        context[name] = function __override(...args) {
            window.stolenCalls += 1;
            return orig.apply(this, args);
        };
    });
})();
