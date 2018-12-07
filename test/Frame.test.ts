import { Frame } from '../src/Frame';
import { expect } from 'chai';
import 'mocha';

describe("Frame", () => {
    let frame: Frame;
    it("#constructor", () => {
        frame = new Frame([]);
        expect(frame.throws).to.be.empty;
    });
    it("#score", () => {
        frame = new Frame([]);
        const badfunc = () => frame.score();
        const msg = "Frame.score is abstract method; it cannot be directly invoked";
        expect(badfunc).throws(msg);
    });
});