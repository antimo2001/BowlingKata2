import { Utility } from '../src/Utility';
import { TenthFrame } from '../src/TenthFrame';
import { expect } from 'chai';
import 'mocha';
import { BowlingGameError } from '../src/BowlingGameError';

class TestSubject {
    public frame: TenthFrame;
    constructor() {
        this.frame = new TenthFrame(0);
    }
    /**
     * Helper function is used to reset this test's frame
     */
    reset(...throws: number[]): TenthFrame {
        this.frame = new TenthFrame(...throws);
        this.frame.setBonusThrows();
        return this.frame;
    }
}

describe("TenthFrame", () => {
    let test: TestSubject;
    beforeEach(() => {
        test = new TestSubject();
    });

    it("gutter balls", () => {
        test.reset(0, 0);
        expect(test.frame.getScore()).to.be.equal(0);
    });

    it("with params: [1, 1]", () => {
        let throws = [1, 1];
        const expectedScore = Utility.sum(...throws);
        const actual = test.reset(...throws).getScore();
        expect(actual).not.NaN;
        expect(actual).to.be.equal(expectedScore);
    });

    it("with params: [2, 6]", () => {
        let throws = [2, 6];
        const expectedScore = Utility.sum(...throws);
        const actual = test.reset(...throws).getScore();
        expect(actual).to.be.equal(expectedScore);
    });

    it("with params: [3, 4]", () => {
        let throws = [3, 4];
        const expectedScore = Utility.sum(...throws);
        const actual = test.reset(...throws).getScore();
        expect(actual).to.be.equal(expectedScore);
    });

    describe("#validateThrows", function () {
        function assertError(rxError: RegExp, ...throws: number[]) {
            let evilfunc = () => test.reset(...throws).validateThrows();
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(rxError);
        }
        it("errors for throw cannot be NaN", () => {
            assertError(/throw cannot be NaN/, NaN, 1);
        });
        it("errors for throw cannot be NaN (part 2)", () => {
            assertError(/throw cannot be NaN/, 2, NaN);
        });
        it("errors when negative pins", () => {
            assertError(/throw cannot be negative/, -1, 2, 3);
        });
        it("errors when negative pins (part 2)", () => {
            assertError(/throw cannot be negative/, 1, -2, 3);
        });
        it("errors when negative pins (part 3)", () => {
            assertError(/throw cannot be negative/, 1, 2, -3);
        });
        it("errors when 3rd throw is undefined", () => {
            assertError(/the 3rd throw cannot be undefined/, 5, 5);
        });
        it("errors when 3rd throw is undefined (part 2)", () => {
            assertError(/the 3rd throw cannot be undefined/, 9, 9);
        });
        it("errors when first throws are too low for a 3rd", () => {
            const rx = /the 3rd throw is not allowed since first throws are too low/;
            assertError(rx, 1, 2, 9);
        });
    });

});