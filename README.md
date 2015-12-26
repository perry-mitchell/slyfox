# Archetype
Restore overwritten methods on the window.

[![Build Status](https://travis-ci.org/perry-mitchell/archetype.svg)](https://travis-ci.org/perry-mitchell/archetype)

## Picking up the pieces
Libraries like Prototype.js do immeasureable harm to the shared environment that are webpages. 3rd party libraries - like those used in tracking and advertising scripts - must ensure that they can cope with whatever broken system is presented to them. Libraries like Prototype assume that what they add is for the benefit of the developer and that single website, and that the extensions they provide won't harm existing functionality - but that's obviously incorrect, and Archetype is here to fix those problems in a simple manner.

### What it does
Archetype provides access to original window methods that may have been overwritten by some script.

### How it does it
The library uses an iframe to create a clean environment in which to extract methods from. When a function is requested from archetype, the main window is checked for a native function - if that function is not native, a native version will be taken from within an iframe, bound to the top-level and returned.

## API

### getNativeMethod(path)
Fetches a native window method at a given path. A path is simply the string representation of a method's location on the window: eg. window.setInterval.

If a method like `window.document.querySelector` is overwritten by some crappy JavaScript, you can retrieve it by calling `var querySelector = archetype.getNativeMethod("window.document.querySelector");`.

### isNative(pathOrMethod)
Checks if a method is native (not overwritten). You can pass a path (eg. "window.setTimeout") or an actual function.

### patchMethod(path)
Patches a method on the top window. This function checks to see if the method on the top window is native or not, and if it **isn't**, it is overwritten with a native copy from the _safe_ window from a clean iframe.
