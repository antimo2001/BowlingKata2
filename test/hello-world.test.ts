import { hello } from '../src/hello-world';
import { expect } from 'chai';
import 'mocha';

describe("hello-world", () => {
    it("says hello", () => {
        expect(hello()).to.equal("Hello world!");
    });
});