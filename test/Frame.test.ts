import { Frame } from '../src/Frame';
import { expect } from 'chai';
import 'mocha';
import debug from 'debug';
const debugFip = debug("test:Frame");

describe("Frame", () => {
    describe("#constructor", () => {
        let gutter: Frame;
        let frame: Frame;
        beforeEach(() => {
            gutter = new Frame(0, 0);
            frame = new Frame(1, 1);
        });
        it("part 1", () => {
            expect(gutter.doneScoring()).to.equal(false);
            gutter.setBonusThrows().getScore();
            expect(gutter.doneScoring()).to.equal(true);
        });
        it("part 2", () => {
            frame = new Frame(1, 1, 2, 2);
            expect(frame.doneScoring()).to.equal(false);
            gutter.setBonusThrows().getScore();
            expect(gutter.doneScoring()).to.equal(true);
        });
        it("part 3", () => {
            frame = new Frame(9, 1, 2, 2);
            expect(frame.doneScoring()).to.equal(false);
            gutter.setBonusThrows().getScore();
            expect(gutter.doneScoring()).to.equal(true);
        });
    });
    describe("#getScore", () => {
        let gutter: Frame;
        let frame: Frame;
        beforeEach(() => {
            gutter = new Frame(0, 0);
            frame = new Frame(1, 1);
        });
        it("part 1", () => {
            expect(gutter.getScore()).to.equal(0);
            expect(frame.getScore()).to.equal(2);
        });
        it("part 2", () => {
            frame = new Frame(1, 1, 2, 2);
            expect(frame.getScore()).to.equal(2);
            expect(frame.getScore()).to.not.equal(6);
        });
        it("part 3", () => {
            frame = new Frame(9, 1, 2, 2);
            expect(frame.getScore()).to.equal(10);
            expect(frame.getScore()).to.not.equal(14);
        });
    });
});