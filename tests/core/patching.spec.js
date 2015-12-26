describe("patching", function() {

	"use strict";

	describe("and fetching native methods", function() {

		var oldSetTimeout;

		beforeEach(function() {
			oldSetTimeout = window.setTimeout;
		});

		afterEach(function() {
			window.setTimeout = oldSetTimeout;
		});

		it("fetches a native version of an overwritten method", function() {
			window.setTimeout = function() {return 0;};
			expect(archetype.isNative(window.setTimeout)).toBe(false);
			var nativeFunc = archetype.getNativeMethod("window.setTimeout");
			expect(archetype.isNative(nativeFunc)).toBe(true);
		});

	});

});
