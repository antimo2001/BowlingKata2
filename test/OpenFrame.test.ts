import 'mocha';
import { expect } from 'chai';
import { OpenFrame } from '../src/OpenFrame';
import { BowlingGameError } from '../src/BowlingGameError';

describe("OpenFrame", () => {
    let frame: OpenFrame;
    it("#constructor", () => {
        frame = new OpenFrame(0, 0);
        expect(frame.getScore()).to.be.equal(0);
    });

    describe("#score", () => {
        it("for params (1, 1)", () => {
            frame = new OpenFrame(1, 1);
            expect(frame.getScore()).to.be.equal(1 + 1);
        });
        it("for params (2, 2)", () => {
            frame = new OpenFrame(2, 2);
            expect(frame.getScore()).to.be.equal(4);
        });
        it("for params (7, 2)", () => {
            frame = new OpenFrame(7, 2);
            expect(frame.getScore()).to.be.equal(9);
        });
        it("for params (1, 2, 9)", () => {
            frame = new OpenFrame(1, 2, 9);
            expect(frame.getScore()).to.be.equal(3);
        });
        it("for params (2, 3, 11, 12)", () => {
            frame = new OpenFrame(2, 3, 11, 12);
            expect(frame.getScore()).to.be.equal(2 + 3);
        });
    });

    describe("#score (iterations)", () => {
        const params = [
            [1, 0],
            [2, 2],
            [3, 1],
            [4, 1],
            [5, 1],
            [6, 2],
            [7, 1],
            [8, 1],
            [9, 0],
            [9, 10],
            [11, 12],
        ];
        params.forEach((item) => {
            const [t1, t2] = item;
            it(`params (${t1},${t2})`, () => {
                frame = new OpenFrame(t1, t2);
                expect(frame.getScore()).to.equal(t1 + t2);
            });
        });
    });

    describe("#validateThrows", () => {
        it("errors when throw is NaN", () => {
            frame = new OpenFrame(NaN, 1);
            const evilfunc = () => frame.validateThrows();
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/throw cannot be NaN/);
        });
        it("errors when throw is NaN (part 2)", () => {
            frame = new OpenFrame(2, NaN);
            const evilfunc = () => frame.validateThrows();
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/throw cannot be NaN/);
        });
        it("errors when 11+ pins", () => {
            frame = new OpenFrame(1, 11);
            let evilfunc = () => frame.validateThrows();
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/2 throws cannot exceed 10 pins/);
        });
        it("errors when 11+ pins (part 2)", () => {
            frame = new OpenFrame(2, 8);
            let evilfunc = () => frame.validateThrows();
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/2 throws cannot exceed 10 pins/);
        });
        it("errors when negative pins", () => {
            frame = new OpenFrame(-1, 3);
            let evilfunc = () => frame.validateThrows();
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/throw cannot be negative/);
        });
        it("errors when negative pins (part 2)", () => {
            frame = new OpenFrame(2, -2);
            let evilfunc = () => frame.validateThrows();
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/throw cannot be negative/);
        });
    });

    describe("Edge cases (negative values)", () => {
        const params = [
            [-1, 0],
            [2, -2],
            [3, -4],
            [4, -6],
            [5, -4],
        ];
        params.forEach((item) => {
            const [t1, t2] = item;
            it(`params (${t1},${t2})`, () => {
                frame = new OpenFrame(t1, t2);
                expect(frame.getScore()).to.equal(t1 + t2);
            });
        });
    });
});