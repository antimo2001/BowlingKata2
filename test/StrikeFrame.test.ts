import { StrikeFrame } from '../src/StrikeFrame';
import { expect } from 'chai';
import 'mocha';

describe("StrikeFrame", () => {
    let frame: StrikeFrame;
    it("#constructor", () => {
        let currentThrows = [10, 0, 0];
        frame = new StrikeFrame(0);
        expect(frame.score(currentThrows)).to.be.equal(10);
    });
    
    it("#score", () => {
        let currentThrows = [10, 0, 0];
        frame = new StrikeFrame(0);
        expect(frame.score(currentThrows)).to.be.equal(10);
    });
});