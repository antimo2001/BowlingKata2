import { StrikeFrame } from '../src/StrikeFrame';
import { expect } from 'chai';
import 'mocha';

describe("StrikeFrame", () => {
    let frame: StrikeFrame;
    it("#constructor", () => {
        frame = new StrikeFrame([]);
        expect(frame.score()).to.be.equal(10);
    });

    it("#score", () => {
        frame = new StrikeFrame([]);
        expect(frame.score()).to.be.equal(10);
    });
});