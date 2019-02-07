import 'mocha';
import { expect } from 'chai';
import debug from 'debug';
import { Utility } from '../src/Utility';
const debugFip = debug("test:Utility");

describe("Utility", () => {
    describe("#sum", () => {
        it("params: (1, 2)", () => {
            expect(Utility.sum(1, 2)).to.equal(3);
        });
        it("params: (2, 4)", () => {
            expect(Utility.sum(2, 4)).to.equal(6);
        });
        it("params: (-3, 4)", () => {
            expect(Utility.sum(-3, 4)).to.equal(1);
        });
        it("params: (4, -8)", () => {
            expect(Utility.sum(4, -8)).to.equal(-4);
        });
        it("params: (1, 3, 5)", () => {
            expect(Utility.sum(1, 3, 5)).to.equal(9);
        });
    });
    describe("#sumApply", () => {
        it("params: (1, 2)", () => {
            expect(Utility.sumApply([1, 2])).to.equal(3);
        });
        it("params: (2, 4)", () => {
            expect(Utility.sumApply([2, 4])).to.equal(6);
        });
        it("params: (-3, 4)", () => {
            expect(Utility.sumApply([-3, 4])).to.equal(1);
        });
        it("params: (4, -8)", () => {
            expect(Utility.sumApply([4, -8])).to.equal(-4);
        });
        it("params: (4, 4, -8)", () => {
            expect(Utility.sumApply([4, 4, -8])).to.equal(0);
        });
    });
    describe("#sum, #sumApply (iterations)", () => {
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
                expect(Utility.sum(...nums)).to.equal(sum);
            });
            it(`#sumApply (${sum})===[${nums}]`, () => {
                expect(Utility.sumApply(nums)).to.equal(sum);
            });
        });
    });
    describe("#range", () => {
        it("simple params", () => {
            const actual = Utility.range(1, 5);
            const expectedRange = [1, 2, 3, 4];
            expect(actual).to.have.ordered.members(expectedRange);
        });
        it("use params: (-1, 11)", () => {
            const actual = Utility.range(-1, 11);
            const expectedRange = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            expect(actual).to.have.ordered.members(expectedRange);
        });
        it("use params: (2, 10, 2)", () => {
            const actual = Utility.range(2, 10, 2);
            const expectedRange = [2, 4, 6, 8];
            expect(actual).to.have.ordered.members(expectedRange);
        });
        it("use params: (3, 10, 2)", () => {
            const actual = Utility.range(3, 10, 2);
            const expectedRange = [3, 5, 7, 9];
            expect(actual).to.have.ordered.members(expectedRange);
        });
    });
    describe("#stall", () => {
        it("stalls in ascending order", async () => {
            let nums: number[] = [1, 2];
            await Promise.all([
                Utility.stall(29).then(() => nums.push(9)),
                Utility.stall(17).then(() => nums.push(7)),
                Utility.stall(5).then(() => nums.push(5)),
            ]);
            debugFip(`nums===${nums}`);
            expect(nums).ordered.members([1, 2, 5, 7, 9]);
        });
        it("stalls in descending order", async () => {
            let nums: number[] = [100, 99];
            await Promise.all([
                Utility.stall(29).then(() => nums.push(69)),
                Utility.stall(17).then(() => nums.push(77)),
                Utility.stall(5).then(() => nums.push(85)),
            ]);
            debugFip(`nums===${nums}`);
            expect(nums).ordered.members([100, 99, 85, 77, 69]);
        });
    });
});
