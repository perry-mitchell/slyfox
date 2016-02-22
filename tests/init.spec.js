describe("asynchronous loading", function() {

    "use strict";

    it("loads when the DOM is ready", function(done) {
        window.archetype.onReady(function(lib) {
            expect(lib.getNativeMethod).toBeDefined();
            (done)();
        });
    });

});
