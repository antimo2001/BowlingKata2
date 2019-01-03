import { Frame } from '../src/Frame';
import { TenthFrame } from '../src/TenthFrame';
import { expect } from 'chai';
import 'mocha';

class TestSubject {
    public frame: TenthFrame;
    constructor() {
        this.frame = new TenthFrame(0);
    }
    /** Helper function is used to reset this test's frame */
    reset(...throws: number[]): TenthFrame {
        this.frame = new TenthFrame(...throws);
        this.frame.setBonusThrows();
        return this.frame;
    }
}

describe("TenthFrame", () => {
    let test: TestSubject;
    beforeEach(() => {
        test = new TestSubject();
    });

    it("gutter balls", () => {
        test.reset(0, 0);
        expect(test.frame.getScore()).to.be.equal(0);
    });

    it("with params: [1, 1]", () => {
        let throws = [1, 1];
        const expectedScore = Frame.sum(...throws);
        const actual = test.reset(...throws).getScore();
        expect(actual).not.NaN;
        expect(actual).to.be.equal(expectedScore);
    });

    it("with params: [2, 6]", () => {
        let throws = [2, 6];
        const expectedScore = Frame.sum(...throws);
        const actual = test.reset(...throws).getScore();
        expect(actual).to.be.equal(expectedScore);
    });

    it("with params: [3, 4]", () => {
        let throws = [3, 4];
        const expectedScore = Frame.sum(...throws);
        const actual = test.reset(...throws).getScore();
        expect(actual).to.be.equal(expectedScore);
    });
});