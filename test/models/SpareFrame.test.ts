import 'mocha';
import { expect } from 'chai';
import { SpareFrame } from '../../src/models/SpareFrame';
import { BowlingGameError } from '../../src/models/BowlingGameError';

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

const expectedSum = (bonus: number) => 10 + bonus;

describe("SpareFrame", () => {
    let test: TestSubject;
    beforeEach(() => {
        test = new TestSubject();
    });

    it("#constructor", () => {
        expect(test.spare.getScore()).to.equal(0);
        //The score for a spare is not yet calculated until bonus has been set!
        test.spare.setBonusThrows(1);
        const expected = expectedSum(1);
        expect(test.spare.getScore()).to.equal(expected);
    });

    describe("#getScore", () => {
        it("when bonus of 3", () => {
            const bonus = 3;
            test.reset(9, bonus);
            const expected = expectedSum(bonus);
            expect(test.spare.getScore()).to.equal(expected);
        });
        it("when bonus of 7", () => {
            const bonus = 7;
            test.reset(9, bonus);
            const expected = expectedSum(bonus);
            expect(test.spare.getScore()).to.equal(expected);
        });
    });

    describe("#getScore (iterations)", () => {
        const baseThrow = 5;
        const bonuses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        bonuses.forEach(bonus => {
            it(`has bonus of ${bonus}`, () => {
                test.reset(baseThrow, bonus);
                const expected = expectedSum(bonus);
                const actual = test.spare.getScore();
                expect(actual).to.equal(expected);
            });
        });
    });

    describe("#validateThrows", () => {
        it("errors when throw is NaN", () => {
            test.reset(NaN, 1);
            const evilfunc = () => test.spare.validateThrows();
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/throw cannot be NaN/);
        });
        it("errors when 11+ pins", () => {
            test.reset(11, 3);
            const evilfunc = () => test.spare.validateThrows();
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/first throw of a spare cannot exceed 10 pins/);
        });
        it("errors when 11+ pins (part 2)", () => {
            test.reset(10, 8);
            const evilfunc = () => test.spare.validateThrows();
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/first throw of a spare cannot exceed 10 pins/);
        });
        it("errors when negative pins", () => {
            test.reset(-1, 3);
            const evilfunc = () => test.spare.validateThrows();
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/throw cannot be negative/);
        });
    });

    describe("#setBonusThrows (error handling)", () => {
        it("errors when bonus is NaN", () => {
            const evilfunc = () => test.reset(5, NaN);
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/bonus of a spare cannot be undefined/);
        });
        it("errors when bonus is negative", () => {
            const evilfunc = () => test.reset(5, -2);
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/bonus cannot be negative/);
        });
        it("errors when bonus exceeds 10 pins", () => {
            const evilfunc = () => test.reset(5, 11);
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/bonus cannot exceed 10 pins/);
        });
    });
});