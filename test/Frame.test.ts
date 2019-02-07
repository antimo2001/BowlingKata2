import 'mocha';
import { expect } from 'chai';
import { Frame } from '../src/Frame';
import { BowlingGameError } from '../src/BowlingGameError';

class Stub extends Frame {
    constructor(...throws: number[]) {
        super(...throws);
    }
    protected canScore(): boolean {
        return true;
    }
    protected setScore(): Frame {
        this.score = 42;
        this.hasBeenScored = true;
        return this;
    }
}

describe("Frame", () => {
    let stub: Stub;

    beforeEach(() => {
        stub = new Stub(0, 1);
    });

    it("#setBonusThrows", () => {
        const fn = () => stub.setBonusThrows(1);
        expect(fn).to.not.throw(Error);
    });
    it("#getScore", () => {
        expect(stub.getScore()).to.equal(42);
    });
    it("#doneScoring", () => {
        expect(stub.doneScoring()).to.be.false;
        stub.getScore();
        expect(stub.doneScoring()).to.be.true;
    });
    it("#getBaseThrows", () => {
        const base = stub.getBaseThrows();
        expect(base.length).to.equal(2);
        expect(base).to.have.members([0, 1]);
    });
    it("#validateThrows", () => {
        const fn = () => stub.validateThrows();
        expect(fn).to.not.throw(Error);
    });
    it("#validateThrows (NaN, 2)", () => {
        stub = new Stub(NaN, 2);
        const evilfunc = () => stub.validateThrows();
        expect(evilfunc).to.throw(BowlingGameError);
    });
    it("#validateThrows (3, NaN)", () => {
        stub = new Stub(3, NaN);
        const evilfunc = () => stub.validateThrows();
        expect(evilfunc).to.throw(BowlingGameError);
    });
});