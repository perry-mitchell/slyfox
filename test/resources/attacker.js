(function() {

    window.stolenCalls = 0;

    [
        [document.createElement, document, "createElement"],
        [document.body.appendChild, document.body, "appendChild"]
    ].forEach(([fn, context, name]) => {
        const orig = fn.bind(context);
        context[name] = function __override(...args) {
            window.stolenCalls += 1;
            return orig(...args);
        };
    });

})();
