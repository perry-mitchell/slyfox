# Archetype
Restore overwritten methods on the window.

[![Build Status](https://travis-ci.org/perry-mitchell/archetype.svg)](https://travis-ci.org/perry-mitchell/archetype)

## Picking up the pieces
Libraries like Prototype.js do immeasureable harm to the shared environment that are webpages. 3rd party libraries - like those used in tracking and advertising scripts - must ensure that they can cope with whatever broken system is presented to them. Libraries like Prototype assume that what they add is for the benefit of the developer and that single website, and that the extensions they provide won't harm existing functionality - but that's obviously incorrect, and Archetype is here to fix those problems in a simple manner.

## What it does
Archetype provides access to original window methods that may have been overwritten by some script.

## How it does it
The library uses an iframe to create a clean environment in which to extract methods from.
