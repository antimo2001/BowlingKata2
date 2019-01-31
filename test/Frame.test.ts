import { Frame } from '../src/Frame';
import { expect } from 'chai';
import 'mocha';
import debug from 'debug';
const debugFip = debug("test:Frame");

describe("Frame", () => {
    describe("static methods", () => {
        describe("#sum", () => {
            it("params: (1, 2)", () => {
                expect(Frame.sum(1, 2)).to.equal(3);
            });
            it("params: (2, 4)", () => {
                expect(Frame.sum(2, 4)).to.equal(6);
            });
            it("params: (-3, 4)", () => {
                expect(Frame.sum(-3, 4)).to.equal(1);
            });
            it("params: (4, -8)", () => {
                expect(Frame.sum(4, -8)).to.equal(-4);
            });
            it("params: (1, 3, 5)", () => {
                expect(Frame.sum(1, 3, 5)).to.equal(9);
            });
        });
        describe("#sumApply", () => {
            it("params: (1, 2)", () => {
                expect(Frame.sumApply([1, 2])).to.equal(3);
            });
            it("params: (2, 4)", () => {
                expect(Frame.sumApply([2, 4])).to.equal(6);
            });
            it("params: (-3, 4)", () => {
                expect(Frame.sumApply([-3, 4])).to.equal(1);
            });
            it("params: (4, -8)", () => {
                expect(Frame.sumApply([4, -8])).to.equal(-4);
            });
            it("params: (4, 4, -8)", () => {
                expect(Frame.sumApply([4, 4, -8])).to.equal(0);
            });
        });
        describe("iterations", () => {
            const iterations = [{
                nums: [1, 2],
                sum: 3,
            }, {
                nums: [11, 22],
                sum: 33,
            }, {
                nums: [1, 2, 3, 4],
                sum: 10,
            }, {
                nums: [10, 20, 30, 40],
                sum: 100,
            }, {
                nums: [-1, 5, 3, -7],
                sum: 0,
            }, {
                nums: [10, 3, -5, -6],
                sum: 2,
            }];
            iterations.forEach((item) => {
                const { nums, sum } = item;
                it(`#sum (${sum})===[${nums}]`, () => {
                    expect(Frame.sum(...nums)).to.equal(sum);
                });
                it(`#sumApply (${sum})===[${nums}]`, () => {
                    expect(Frame.sumApply(nums)).to.equal(sum);
                });
            });
        });
    });
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