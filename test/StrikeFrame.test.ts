import { Utility } from '../src/Utility';
import { StrikeFrame } from '../src/StrikeFrame';
import { expect } from 'chai';
import 'mocha';

const sumReduce = Utility.sum;

class TestSubject {
    public strike: StrikeFrame;
    constructor() {
        this.strike = new StrikeFrame();
    }
    /** Helper function is used to reset this test's frame */
    resetBonus(bonus1: number, bonus2: number): void {
        this.strike = new StrikeFrame();
        this.strike.setBonusThrows(bonus1, bonus2);
    }
}

describe("StrikeFrame", () => {
    let test: TestSubject;
    beforeEach(() => {
        test = new TestSubject();
    });

    it("#constructor: initial state", () => {
        //The score is not yet calculated, so it should be zero
        expect(test.strike.getScore()).to.equal(0);
    });
    it("#constructor: setBonusThrows(1, 2)", () => {
        test.strike.setBonusThrows(1, 2);
        //The score for a strike is calculated after the bonus is set!
        expect(test.strike.getScore()).to.equal(10 + 3);
    });

    describe("#getScore", () => {
        it("when bonuses are (8, 1)", () => {
            const bonus = [8, 1];
            test.resetBonus(bonus[0], bonus[1]);
            const expected = sumReduce(10, ...bonus);
            expect(test.strike.getScore()).to.equal(expected);
        });
        it("when bonuses are (4, 3)", () => {
            const bonus = [4, 3];
            test.resetBonus(bonus[0], bonus[1]);
            const expected = sumReduce(10, ...bonus);
            expect(test.strike.getScore()).to.equal(expected);
        });
    });

    describe("#getScore (iterations)", () => {
        const bonuses = [
            [1, 2], [2, 3],
            [3, 4], [4, 5],
            [6, 3], [7, 2],
            [8, 1], [9, 0],
        ];
        bonuses.forEach((bonus) => {
            const [x, y] = bonus;
            const expected = sumReduce(10, x, y);
            it(`with bonus of (${x},${y})`, () => {
                test.resetBonus(x, y);
                expect(test.strike.getScore()).to.equal(expected);
            });
        });
    });

    describe("Edge cases (negative bonuses)", () => {
        const bonuses = [
            [-1, 2], [-2, 3],
            [-3, 4], [-4, 5],
            [-6, 3], [-7, 2],
            [-8, 1], [-9, 0],
        ];
        bonuses.forEach((bonus) => {
            const [x, y] = bonus;
            const expected = sumReduce(10, x, y);
            it(`with bonus of (${x},${y})`, () => {
                test.resetBonus(x, y);
                expect(test.strike.getScore()).to.equal(expected);
            });
        });
    });
});