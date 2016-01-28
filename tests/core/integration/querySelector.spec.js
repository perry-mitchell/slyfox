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
		});

		it("is equal to querySelector on HTML elements", function() {
			var childElement = document.createElement("div");
			childElement.setAttribute("class", "childDiv");
			targetElement.appendChild(childElement);
			targetElement.querySelector = function() { return null; };
			var qs = archetype.getNativeMethod("window.document.body.querySelector", targetElement),
				elTop = targetElement.querySelector(".childDiv"),
				elSub = qs(".childDiv");

			expect(elSub instanceof HTMLDivElement).toBe(true);
			expect(elTop).toBe(null);
		});
	});
});
