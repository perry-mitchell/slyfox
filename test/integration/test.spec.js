import { expect } from "chai";
import fs from "node:fs/promises";
import path from "node:path";
import URL from "node:url";
import puppeteer from "puppeteer";

const __dirname = path.dirname(URL.fileURLToPath(import.meta.url));

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), ms);
    });
}

describe("SlyFox", function() {
    before(async function() {
        this.browser = await puppeteer.launch({
            args: ["--no-sandbox"],
            headless: true
        });
    });

    after(async function() {
        await this.browser.close();
    });

    beforeEach(async function() {
        // Create page
        this.page = await this.browser.newPage();
        // Debugging
        this.page
            .on("console", message =>
                console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`)
            )
            .on("pageerror", ({ message }) => console.log(message))
            .on("response", response =>
                console.log(`${response.status()} ${response.url()}`)
            )
            .on("requestfailed", request =>
                console.log(`${request.failure().errorText} ${request.url()}`)
            );
        // Setup document
        await this.page.goto("about:blank");
        await this.page.setViewport({ width: 1024, height: 768 });
        await this.page.evaluate(async function() {
            const root = document.createElement("root");
            root.id = "root";
            document.body.appendChild(root);
        });
        await this.page.waitForSelector("#root");
    });

    async function embedSlyFox() {
        const scriptPath = path.resolve(__dirname, "../../dist/test/slyfox.js");
        await this.page.addScriptTag({ path: scriptPath });
    }

    async function embedAttacker() {
        const scriptPath = path.resolve(__dirname, "../resources/attacker.js");
        await this.page.addScriptTag({ path: scriptPath });
    }

    describe("with attacker first", function() {
        beforeEach(async function() {
            await embedAttacker.call(this);
            await sleep(100);
            await embedSlyFox.call(this);
            await sleep(100);
        });

        it("provides original function on document", async function() {
            const stolenCalls = await this.page.evaluate(async function() {
                const sesh = await window.SlyFox.createSession();
                const dce = sesh.getNativeMethod("document.createElement");
                dce("div");
                return window.stolenCalls;
            });
            expect(stolenCalls).to.equal(0, "There should be no calls to attacker's overrides");
        });
    });
});
