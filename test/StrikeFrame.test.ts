import { StrikeFrame } from '../src/StrikeFrame';
import { expect } from 'chai';
import 'mocha';

describe("StrikeFrame", () => {
    let frame: StrikeFrame;
    it("#constructor", () => {
        frame = new StrikeFrame();
        expect(frame.getScore()).to.be.equal(0);
    });
    
    it("#score", () => {
        frame = new StrikeFrame();
        expect(frame.getScore()).to.be.equal(0);
    });
});