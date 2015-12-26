describe("patching", function() {

	"use strict";

	var oldSetTimeout,
		oldQuerySelector;

	beforeEach(function() {
		oldSetTimeout = window.setTimeout;
		oldQuerySelector = window.document.querySelector;
	});

	afterEach(function() {
		window.setTimeout = oldSetTimeout;
		window.document.querySelector = oldQuerySelector;
	});

	describe("and fetching native methods", function() {

		it("fetches a native version of an overwritten method", function() {
			window.setTimeout = function() {return 0;};
			expect(archetype.isNative(window.setTimeout)).toBe(false);
			var nativeFunc = archetype.getNativeMethod("window.setTimeout");
			expect(archetype.isNative(nativeFunc)).toBe(true);
		});

	});

	describe("and patching overwritten methods", function() {

		it("patches correctly", function() {
			window.document.querySelector = function() {return null;};
			expect(archetype.isNative("window.document.querySelector")).toBe(false);
			archetype.patchMethod("window.document.querySelector");
			expect(archetype.isNative("window.document.querySelector")).toBe(true);
		});

	});

});
