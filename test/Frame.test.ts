import { Frame } from '../src/Frame';
import { expect } from 'chai';
import 'mocha';

describe("Frame", () => {
    let frame: Frame;
    it("#constructor", () => {
        frame = new Frame(0);
        // expect(frame.getThrows()).to.be.empty;
    });
    it("#score", () => {
        frame = new Frame(0);
        const scoreMethod = () => frame.score([1, 0]);
        const errorMessage = "Frame.score is abstract method; it cannot be directly invoked";
        expect(scoreMethod).throws(errorMessage);
    });
});