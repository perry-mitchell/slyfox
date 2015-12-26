describe("detection", function() {

	"use strict";

	describe("with paths", function() {

		it("can detect native methods", function() {
			expect(archetype.isNative("window.setTimeout")).toBe(true);
		});

		it("can detect non-native methods", function() {
			window.testSetTimeout = function() {};
			expect(archetype.isNative("window.testSetTimeout")).toBe(false);
		});

		it("returns false for non-existant methods", function() {
			expect(archetype.isNative("window.notSet")).toBe(false);
		});

		it("can use shorthand paths", function() {
			expect(archetype.isNative("document.querySelectorAll")).toBe(true);
		});

	});

	describe("with methods", function() {

		it("can detect native methods", function() {
			expect(archetype.isNative(window.setTimeout)).toBe(true);
		});

		it("can detect non-native methods", function() {
			window.testSetTimeout = function() {};
			expect(archetype.isNative(window.testSetTimeout)).toBe(false);
		});

		it("returns false for non-existant methods", function() {
			expect(archetype.isNative(window.notSet)).toBe(false);
		});

	});

});
