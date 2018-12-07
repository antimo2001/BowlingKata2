import { OpenFrame } from '../src/OpenFrame';
import { expect } from 'chai';
import 'mocha';

describe("OpenFrame", () => {
    let frame: OpenFrame;
    it("#constructor", () => {
        frame = new OpenFrame([], 0, 0);
        // console.log(`...DEBUGTESTS: frame.throws==${frame.throws}`);
        expect(frame.throws).to.be.include(0);
        expect(frame.score()).to.be.equal(0);
    });

    describe("#score", () => {
        it("with params [], 1, 1", () => {
            frame = new OpenFrame([], 1, 1);
            expect(frame.score()).to.be.equal(1 + 1);
        });
        it("with params [], 2, 2", () => {
            frame = new OpenFrame([], 2, 2);
            expect(frame.score()).to.be.equal(2 + 2);
        });
        it("with params [], 7, 2", () => {
            frame = new OpenFrame([], 7, 2);
            expect(frame.score()).to.be.equal(7 + 2);
        });
        it("with params [1,2,3,4], 7, 2", () => {
            let throws = [1,2,3,4];
            frame = new OpenFrame(throws, 7, 2);
            expect(frame.score()).to.be.equal(7 + 2);
        });
        it("with params [2,3,3,5], 2, 4", () => {
            let throws = [2,3,3,5];
            frame = new OpenFrame(throws, 2, 4);
            expect(frame.score()).to.be.equal(2 + 4);
        });
    });
});