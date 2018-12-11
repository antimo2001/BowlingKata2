import { hello } from '../src/hello-world';
import { expect } from 'chai';
import 'mocha';
import debug from 'debug';

/** Define a debug function for this test */
const debugLog = debug('test:hello-world');

describe("hello-world", () => {
    it("says hello", () => {
        expect(hello()).to.equal("Hello world!");
    });

    it("debug module also says hello", () => {
        // debugLog(`...debug also says hello!`);
        expect(hello()).to.equal("Hello world!");
    });
});