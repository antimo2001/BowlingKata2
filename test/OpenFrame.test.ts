import { OpenFrame } from '../src/OpenFrame';
import { expect } from 'chai';
import 'mocha';

describe("OpenFrame", () => {
    let frame: OpenFrame;
    it("#constructor", () => {
        frame = new OpenFrame(0);
        expect(frame.score([0, 0])).to.be.equal(0);
    });

    describe("#score", () => {
        it("with params index 0; score[1, 1]", () => {
            frame = new OpenFrame(0);
            expect(frame.score([1, 1])).to.be.equal(1 + 1);
        });
        it("with params index 0; score[2, 2]", () => {
            frame = new OpenFrame(0);
            expect(frame.score([2, 2])).to.be.equal(2 + 2);
        });
        it("with params index 0; score[7, 2]", () => {
            frame = new OpenFrame(0);
            expect(frame.score([7, 2])).to.be.equal(7 + 2);
        });
        it("with params [1,2,3,4], 7, 2", () => {
            let throws = [1, 2, 3, 4];
            let current = [7, 2];
            frame = new OpenFrame(throws.length);
            expect(frame.score([...throws, ...current])).to.be.equal(7 + 2);
        });
        it("with params [2,3,3,5], 2, 4", () => {
            let throws = [2, 3, 3, 5];
            let current = [2, 4];
            frame = new OpenFrame(throws.length);
            expect(frame.score([...throws, ...current])).to.be.equal(2 + 4);
        });
    });
});