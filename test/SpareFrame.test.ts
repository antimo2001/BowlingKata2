import { SpareFrame } from '../src/SpareFrame';
import { expect } from 'chai';
import 'mocha';

describe("SpareFrame", () => {
    let frame: SpareFrame;
    it("#constructor", () => {
        frame = new SpareFrame(0);
        expect(frame.getScore()).to.be.equal(0);
    });

    describe("#score", () => {
        it("with index 0; score([1])", () => {
            let currentThrows = [1];
            frame = new SpareFrame(0);
            expect(frame.getScore()).to.be.equal(0);
            expect(frame.getScore()).not.NaN;
        });
        it("with index 0; score([3])", () => {
            let currentThrows = [3];
            frame = new SpareFrame(0);
            expect(frame.getScore()).to.be.equal(0);
        });
        it("with index 0; score([5])", () => {
            let currentThrows = [5];
            frame = new SpareFrame(0);
            expect(frame.getScore()).to.be.equal(0);
        });
    });
});