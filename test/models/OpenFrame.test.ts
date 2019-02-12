import 'mocha';
import { expect } from 'chai';
import { OpenFrame } from '../../src/models/OpenFrame';
import { BowlingGameError } from '../../src/models/BowlingGameError';

describe("OpenFrame", () => {
    let open: OpenFrame;

    it("#constructor", () => {
        open = new OpenFrame(0, 0);
        expect(open.getScore()).to.be.equal(0);
    });

    it("#setBonusThrows", () => {
        open = new OpenFrame(0, 1);
        const fn = () => open.setBonusThrows();
        expect(fn).to.not.throw(Error);
    });

    describe("#score", () => {
        it("for params (1, 1)", () => {
            open = new OpenFrame(1, 1);
            expect(open.getScore()).to.be.equal(1 + 1);
        });
        it("for params (2, 2)", () => {
            open = new OpenFrame(2, 2);
            expect(open.getScore()).to.be.equal(4);
        });
        it("for params (7, 2)", () => {
            open = new OpenFrame(7, 2);
            expect(open.getScore()).to.be.equal(9);
        });
        it("for params (1, 2, 9)", () => {
            open = new OpenFrame(1, 2, 9);
            expect(open.getScore()).to.be.equal(3);
        });
        it("for params (2, 3, 11, 12)", () => {
            open = new OpenFrame(2, 3, 11, 12);
            expect(open.getScore()).to.be.equal(2 + 3);
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
                open = new OpenFrame(t1, t2);
                expect(open.getScore()).to.equal(t1 + t2);
            });
        });
    });

    describe("#validateThrows", () => {
        it("errors when (NaN, 1)", () => {
            open = new OpenFrame(NaN, 1);
            const evilfunc = () => open.validateThrows();
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/throw cannot be NaN/);
        });
        it("errors when (2, NaN)", () => {
            open = new OpenFrame(2, NaN);
            const evilfunc = () => open.validateThrows();
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/throw cannot be NaN/);
        });
        it("errors when (1, 11)", () => {
            open = new OpenFrame(1, 11);
            const evilfunc = () => open.validateThrows();
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/2 throws cannot exceed 10 pins/);
        });
        it("errors when (2, 8)", () => {
            open = new OpenFrame(2, 8);
            const evilfunc = () => open.validateThrows();
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/2 throws cannot exceed 10 pins/);
        });
        it("errors when (-1, 3)", () => {
            open = new OpenFrame(-1, 3);
            const evilfunc = () => open.validateThrows();
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/throw cannot be negative/);
        });
        it("errors when (2, -2)", () => {
            open = new OpenFrame(2, -2);
            const evilfunc = () => open.validateThrows();
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/throw cannot be negative/);
        });
    });

});