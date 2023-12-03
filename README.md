# SlyFox
> Restore overwritten methods on the window and document... **Like a fox**.

[![slyfox](https://img.shields.io/npm/v/slyfox?color=blue&label=slyfox&logo=npm&style=flat-square)](https://www.npmjs.com/package/slyfox) ![Tests status](https://github.com/perry-mitchell/slyfox/actions/workflows/test.yml/badge.svg) ![GitHub](https://img.shields.io/github/license/perry-mitchell/slyfox)

## About

It's entirely possible, during the execution of a web page, for JavaScript to override many of the core functions providing access to the DOM. This is generally a terrible idea - core functions like `document.createElement` have very broad use, and overriding them can be dangerous. Why would someone override such a method? There's a number of reasons apparently:

 * **PrototypeJS** (some versions) thought it was necessary to provide improved support
 * Companies like **Osano** believe it's their right when protecting their clients from scripts that don't properly check for data transmission consent
 * Some website owners believe that every element passing through such a method should be manipulated or scanned

Whatever the reason it's simply a **bad idea**.

**SlyFox** (formerly `archetype`) is a restoration library aimed at retrieving non-tampered-with method originals through the use of a "safe" iframe it embeds. Copies of these unaltered functions are pulled from the iframe and provided to the caller.

Unlike this library's predecessor, SlyFox does _not_ write these functions over the altered versions. There's ultimately no point fighting like that. This is more of a ponyfill approach rather than a polyfill.

## Installation

Install using `npm install slyfox --save-dev`.

SlyFox provides both an ESM (primary) entry and a UMD build that can be directly injected into browsers. The UMD script is located at `dist/umd/index.js`. Both builds provide types.

## Usage

When using the default (ESM) entry, import the `createSession` helper to create a new `RestoreSession` instance. From there you can immediately fetch restored native methods:

```typescript
import { createSession } from "slyfox";

async function program() {
    const session = await createSession();
    const createEl = session.getNativeMethod("document.createElement");
    const div = createEl("div");
}
```

Keep the `RestoreSession` instance around and call it when needed. It caches fetched/bound methods so it doesn't have to reproduce them again every call.

You can also pre-cache some function lookups so you might potentially capture the un-modified versions if you're early enough:

```typescript
session.precacheMethods([
    "document.createElement",
    "document.body.appendChild"
]);
```

### Caveats

Remember that the returned functions from `getNativeMethod` are _not_ identical to the original function that was overwritten. That original is either lost or not provided via this library. What is returned is either:

 * The original function, but bound to its parent. Eg. `document.querySelector.bind(document)`.
 * A recovered copy from another _iframe_, bound to the parent of the top/target frame.

In any case, the elements you interact with, potentially, might not function in the way you'd expect them too with normal calls. Never use `instanceof` as this might return unexpected values when using this library.
