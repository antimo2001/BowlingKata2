import { OpenFrame } from '../src/OpenFrame';
import { expect } from 'chai';
import 'mocha';

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
        it("for params (1, 2, 3)", () => {
            frame = new OpenFrame(1, 2, 3);
            expect(frame.getScore()).to.be.equal(3);
        });
    });
});