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
        stub.setBonusThrows(1);
    });

    describe("when Stub extends Frame", () => {
        it("#getBaseThrows", () => {
            expect(stub.getBaseThrows().length).to.equal(2);
            expect(stub.getBaseThrows()).to.have.members([0, 1]);
        });
        it("#getScore", () => {
            expect(stub.getScore()).to.equal(42);
        });
        it("#doneScoring", () => {
            expect(stub.getScore()).to.equal(42);
            expect(stub.doneScoring()).to.be.true;
        });
        it("#validateThrows", () => {
            const cleanfunc = () => stub.validateThrows();
            expect(cleanfunc).to.not.throw(BowlingGameError);
        });
    });
});