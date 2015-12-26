describe("initialisation", function() {

	"use strict";

	it("creates 'archetype' on the window", function() {
		expect(window.archetype).toBeDefined();
	});

	it("creates an iframe", function() {
		var frame = document.querySelector('iframe[owner="archetype"]');
		expect(frame instanceof HTMLIFrameElement).toBe(true);
	});

});
