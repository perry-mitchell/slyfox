describe("integration: querySelector & querySelectorAll", function() {

	"use strict";

	describe("querySelector", function() {

		var targetElement,
			oldQuerySelector;

		beforeEach(function(done) {
			oldQuerySelector = document.querySelector;
			targetElement = document.createElement("div");
			targetElement.setAttribute("class", "testDiv");
			document.body.appendChild(targetElement);
			setTimeout(done, 100);
		});

		afterEach(function() {
			targetElement.parentNode.removeChild(targetElement);
			document.querySelector = oldQuerySelector;
		});

		it("is equal to querySelector on the main window", function() {
			var qs = archetype.getNativeMethod("window.document.querySelector"),
				elTop = document.querySelector(".testDiv"),
				elSub = qs(".testDiv");
			expect(elSub instanceof HTMLDivElement).toBe(true);
			expect(elSub).toBe(elTop);
		});

		it("is equal to querySelector on the safe window when overwritten", function() {
			document.querySelector = function() { return null; };
			var qs = archetype.getNativeMethod("window.document.querySelector"),
				elTop = document.querySelector(".testDiv"),
				elSub = qs(".testDiv");
			expect(elSub instanceof HTMLDivElement).toBe(true);
			expect(elTop).toBe(null);
		})

	});

});
