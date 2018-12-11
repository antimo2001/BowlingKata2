import { SpareFrame } from '../src/SpareFrame';
import { expect } from 'chai';
import 'mocha';

describe("SpareFrame", () => {
    let frame: SpareFrame;
    it("#constructor", () => {
        frame = new SpareFrame([], 1);
        expect(frame.score()).to.be.equal(10);
    });

    describe("#score", () => {
        it("with params [], 1", () => {
            frame = new SpareFrame([], 1);
            expect(frame.score()).to.be.equal(10);
            expect(frame.score()).not.NaN;
        });
        it("with params [], 3", () => {
            frame = new SpareFrame([], 3);
            expect(frame.score()).to.be.equal(10);
        });
        it("with params [], 5", () => {
            frame = new SpareFrame([], 5);
            expect(frame.score()).to.be.equal(10);
        });
    });
});