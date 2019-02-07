import 'mocha';
import { expect } from 'chai';
import debug from 'debug';
import { hello } from '../src/hello-world';

const debugLog = debug('test:hello-world');

describe("hello-world", () => {
    it("says hello", () => {
        expect(hello()).to.equal("Hello world!");
    });

    it("debug module also says hello", () => {
        debugLog(`...debug also says hello!`);
        expect(hello()).to.equal("Hello world!");
    });
});