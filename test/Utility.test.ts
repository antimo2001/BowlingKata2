import 'mocha';
// import debug from 'debug';
import { expect } from 'chai';
import { Utility } from '../src/Utility';

describe("Utility", function() {
    describe("#range", function() {
        it("simple params", function() {
            const actual = Utility.range(1, 5);
            const expectedRange = [1, 2, 3, 4];
            expect(actual).to.have.ordered.members(expectedRange);
        });
        it("use params: (-1, 11)", function() {
            const actual = Utility.range(-1, 11);
            const expectedRange = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            expect(actual).to.have.ordered.members(expectedRange);
        });
        it("use params: (2, 10, 2)", function() {
            const actual = Utility.range(2, 10, 2);
            const expectedRange = [2, 4, 6, 8];
            expect(actual).to.have.ordered.members(expectedRange);
        });
        it("use params: (3, 10, 2)", function() {
            const actual = Utility.range(3, 10, 2);
            const expectedRange = [3, 5, 7, 9];
            expect(actual).to.have.ordered.members(expectedRange);
        });
    });
});
