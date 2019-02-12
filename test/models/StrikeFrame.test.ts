import 'mocha';
import { expect } from 'chai';
import { Utility } from '../../src/Utility';
import { StrikeFrame } from '../../src/models/StrikeFrame';
import { BowlingGameError } from '../../src/models/BowlingGameError';

const expectedSum = (...bonus: number[]) => Utility.sum(10, ...bonus);

describe("StrikeFrame", () => {
    let strike: StrikeFrame;

    beforeEach(() => {
        strike = new StrikeFrame();
    });

    describe("#constructor", () => {
        it("no calculated score yet", () => {
            expect(strike.score).to.equal(0);
        });
        it("setBonusThrows(1, 2)", () => {
            strike.setBonusThrows(1, 2);
            //The score for a strike is calculated after the bonus is set!
            expect(strike.score).to.equal(expectedSum(3));
        });
    });

    describe("#getScore", () => {
        it("bonus: [8, 1]", () => {
            const bonus = [8, 1];
            const expected = expectedSum(...bonus);
            strike.setBonusThrows(...bonus);
            expect(strike.score).to.equal(expected);
        });
        it("bonus: [4, 3]", () => {
            const bonus = [4, 3];
            const expected = expectedSum(...bonus);
            strike.setBonusThrows(...bonus);
            expect(strike.score).to.equal(expected);
        });
        it("bonus: [10, 9]", () => {
            const bonus = [10, 9];
            const expected = expectedSum(...bonus);
            strike.setBonusThrows(...bonus);
            expect(strike.score).to.equal(expected);
        });
    });

    describe("#getScore (iterations)", () => {
        const bonuses = [
            [1, 2], [2, 3],
            [3, 4], [4, 5],
            [6, 3], [7, 2],
            [8, 1], [9, 0],
        ];
        bonuses.forEach(bonus => {
            const [ x, y ] = bonus;
            const expected = expectedSum(x, y);
            it(`with bonus of (${x},${y})`, () => {
                strike.setBonusThrows(x, y);
                expect(strike.score).to.equal(expected);
            });
        });
    });

    describe("#setBonusThrows (error handling)", () => {
        it("errors when bonus is NaN", () => {
            const evilfunc = () => strike.setBonusThrows(NaN, 1);
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/bonus of a strike cannot be undefined/);
        });
        it("errors when bonus is NaN (part 2)", () => {
            const evilfunc = () => strike.setBonusThrows(2, NaN);
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/bonus of a strike cannot be undefined/);
        });
        it("errors when bonus is negative", () => {
            const evilfunc = () => strike.setBonusThrows(-3, 3);
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/bonus cannot be negative/);
        });
        it("errors when bonus is negative (part 2)", () => {
            const evilfunc = () => strike.setBonusThrows(4, -4);
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/bonus cannot be negative/);
        });
        it("errors when bonus exceeds 10 pins", () => {
            const evilfunc = () => strike.setBonusThrows(15, 1);
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/bonus cannot exceed 10 pins/);
        });
        it("errors when bonus exceeds 10 pins (part 2)", () => {
            const evilfunc = () => strike.setBonusThrows(1, 16);
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/bonus cannot exceed 10 pins/);
        });
    });

});