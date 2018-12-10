import { StrikeFrame } from '../src/StrikeFrame';
import { expect } from 'chai';
import 'mocha';

describe("StrikeFrame", () => {
    let frame: StrikeFrame;
    it("#constructor", () => {
        frame = new StrikeFrame([]);
        // console.log(`...DEBUGTESTS: frame.throws==${frame.throws}`);
        expect(frame.score()).to.be.equal(10);
    });

    describe("#score", () => {
        it("with params [], 1", () => {
            frame = new StrikeFrame([]);
            expect(frame.score()).to.be.equal(10);
        });
    });
});