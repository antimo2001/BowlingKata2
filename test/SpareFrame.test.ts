import { Utility } from '../src/Utility';
import { SpareFrame } from '../src/SpareFrame';
import { expect } from 'chai';
import 'mocha';

class TestSubject {
    public spare: SpareFrame;
    constructor() {
        //Intialize with the unique gutter-spare
        this.spare = new SpareFrame(0);
    }
    /**
     * Helper function is used to reset this test's frame
     */
    reset(baseThrow: number, bonus: number): void {
        this.spare = new SpareFrame(baseThrow);
        this.spare.setBonusThrows(bonus);
    }
}

describe("SpareFrame", () => {
    let test: TestSubject;
    beforeEach(() => {
        test = new TestSubject();
    });
    it("#constructor", () => {
        expect(test.spare.getScore()).to.equal(0);
        //The score for a spare is not yet calculated until bonus has been set!
        test.spare.setBonusThrows(1);
        expect(test.spare.getScore()).to.equal(10 + 1);
    });

    describe("#getScore", () => {
        it("when bonus of 3", () => {
            const bonus = 3;
            test.reset(9, bonus);
            const expected = Utility.sum(10, bonus);
            expect(test.spare.getScore()).to.equal(expected);
        });
        it("when bonus of 7", () => {
            const bonus = 7;
            test.reset(9, bonus);
            const expected = Utility.sum(10, bonus);
            expect(test.spare.getScore()).to.equal(expected);
        });
    });

    describe("#getScore (iterations)", () => {
        const baseThrow = 5;
        const bonuses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 19];
        bonuses.forEach((bonus) => {
            it(`has bonus of ${bonus}`, () => {
                test.reset(baseThrow, bonus);
                const expected = Utility.sum(10, bonus);
                const actual = test.spare.getScore();
                expect(actual).to.equal(expected);
            });
        });
    });
});