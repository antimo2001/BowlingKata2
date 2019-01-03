import { Frame } from '../src/Frame';
import { SpareFrame } from '../src/SpareFrame';
import { expect } from 'chai';
import 'mocha';

class TestSubject {
    public frame: SpareFrame;
    public expectedScore: number;
    constructor() {
        //Intialize with the unique gutter-spare
        this.frame = new SpareFrame(0);
        this.expectedScore = 0;
    }
    /** Helper function is used to reset this test's frame */
    reset(baseThrow: number, bonus: number): void {
        this.frame = new SpareFrame(baseThrow);
        this.frame.setBonusThrows(bonus);
        this.expectedScore = Frame.sum(10, bonus);
    }
}

describe("SpareFrame", () => {
    let test: TestSubject;
    beforeEach(() => {
        test = new TestSubject();
    });
    it("#constructor", () => {
        expect(test.frame.getScore()).to.equal(0);
        //The score for a spare is not yet calculated until bonus has been set!!
        test.frame.setBonusThrows(1);
        expect(test.frame.getScore()).to.equal(10 + 1);
    });

    describe("#getScore", () => {
        it("with bonus of [3]", () => {
            let base = 9;
            let bonus = 3;
            test.reset(base, bonus);
            expect(test.frame.getScore()).to.equal(test.expectedScore);
        });
        it("with bonus of [7]", () => {
            let base = 9;
            let bonus = 7;
            test.reset(base, bonus);
            expect(test.frame.getScore()).to.equal(test.expectedScore);
        });
    });

    describe("#getScore - iterate through bonuses", () => {
        const baseThrow = 5;
        const bonuses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        bonuses.forEach((bonus) => {
            it(`with bonus of ${bonus}`, () => {
                test.reset(baseThrow, bonus);
                expect(test.frame.getScore()).to.equal(test.expectedScore);
            });
        });
    });
});