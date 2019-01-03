import { Frame } from '../src/Frame';
import { StrikeFrame } from '../src/StrikeFrame';
import { expect } from 'chai';
import 'mocha';

class TestSubject {
    public frame: StrikeFrame;
    public expectedScore: number;
    constructor() {
        //Intialize with the unique gutter-spare
        this.frame = new StrikeFrame();
        this.expectedScore = 0;
    }
    /** Helper function is used to reset this test's frame */
    reset(bonus1: number, bonus2: number): void {
        this.frame = new StrikeFrame();
        this.frame.setBonusThrows(bonus1, bonus2);
        this.expectedScore = Frame.sum(10, bonus1, bonus2);
    }
}

describe("StrikeFrame", () => {
    let test: TestSubject;
    beforeEach(() => {
        test = new TestSubject();
    });

    it("#constructor", () => {
        //The score is not yet calculated
        expect(test.frame.getScore()).to.equal(0);
        test.frame.setBonusThrows(1, 2);
        //The score for a strike is calculated after the bonus is set!
        expect(test.frame.getScore()).to.equal(10 + 3);
    });

    describe("#getScore", () => {
        it("with bonuses of (8, 1)", () => {
            test.reset(8, 1);
            expect(test.frame.getScore()).to.equal(test.expectedScore);
        });
        it("with bonuses of (4, 3)", () => {
            test.reset(4, 3);
            expect(test.frame.getScore()).to.equal(test.expectedScore);
        });
    });

    describe("#getScore - iterate through bonuses", () => {
        const bonuses = [
            [1, 2], [2, 3],
            [3, 4], [4, 5],
            [6, 3], [7, 2],
            [8, 1], [9, 0],
        ];
        bonuses.forEach((bonus) => {
            const [x, y] = bonus;
            it(`with bonus of (${x},${y})`, () => {
                test.reset(x, y);
                expect(test.frame.getScore()).to.equal(test.expectedScore);
            });
        });
    });
});