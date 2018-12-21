import { Frame } from '../src/Frame';
import { expect } from 'chai';
import 'mocha';
import debug from 'debug';
const debugFip = debug("fip01:test:Frame");

describe("Frame", () => {
    let gutter: Frame;
    let frame: Frame;
    beforeEach(() => {
        gutter = new Frame(0, 0);
        frame = new Frame(1, 1);
    });
    describe("static methods", () => {
        it("#sum", () => {
            expect(Frame.sum(1, 2)).to.equal(3);
            expect(Frame.sum(11, 22)).to.equal(33);
            expect(Frame.sum(1, 2, 3, 4)).to.equal(10);
            expect(Frame.sum(40, 30, 20, 10)).to.equal(100);
        });
        it("#sumApply", () => {
            expect(Frame.sumApply([1, 2])).to.equal(3);
            expect(Frame.sumApply([11, 22])).to.equal(33);
            expect(Frame.sumApply([1, 2, 3, 4])).to.equal(10);
            expect(Frame.sumApply([40, 30, 20, 10])).to.equal(100);
        });
    });
    describe("#constructor", () => {
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
        it("#getScore, part 3", () => {
            frame = new Frame(9, 1, 2, 2);
            expect(frame.doneScoring()).to.equal(false);
            gutter.setBonusThrows().getScore();
            expect(gutter.doneScoring()).to.equal(true);
        });
    });
    describe("#getScore", () => {
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