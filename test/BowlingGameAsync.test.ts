import 'mocha';
import debug from 'debug';
import { expect } from 'chai';
import { Frame } from '../src/Frame';
import { BowlingGameAsync } from '../src/BowlingGameAsync';
import { BowlingGameError } from '../src/BowlingGameError';
import { Utility } from '../src/Utility';

/** Helper functions for debugging other fixes in-progress */
const debugs = {
    fip00: debug("fip00:test:BowlingGameAsync"),
    fip01: debug("fip01:test:BowlingGameAsync"),
    //FYI: FIP stands for fix in-progress
};

/** Helper function for calculating the sum */
const sumReduce = Frame.sum;

class TestSubject {
    public game: BowlingGameAsync;
    constructor() {
        this.game = new BowlingGameAsync();
    }
    /**
     * Helper function is used to execute multiple open-frames for a game
     * @param loopCount number of loops
     * @param throw1 number of pins knocked down in the 1st throw
     * @param throw2 number of pins knocked down in the 2nd throw
     */
    async playOpenFrames(loopCount: number, throw1: number, throw2: number): Promise<void> {
        await this.playMultipleFrames(loopCount, () => {
            return this.game.open(throw1, throw2);
        });
    }
    /**
     * Helper function is for invoking multiple frames (of any type) for a game
     * @param loopCount the number of times to iterate
     * @param iterator the callback that creates the Promise to be iterated over
     */
    async playMultipleFrames(loopCount: number, iterator: () => Promise<void>): Promise<void> {
        const range = Utility.range(1, loopCount + 1);
        debugs.fip01(`playMultipleFrames: range===${range}`);
        for await (let i of range) {
            // debugs.fip01(`range[${i}]`);
            await iterator.call(this);
        }
    }
}

describe("BowlingGameAsync", function() {
    let test: TestSubject;

    beforeEach(function() {
        test = new TestSubject();
    });

    describe("#openFrame", function() {
        it("single frame", async function() {
            await test.game.open(1, 2);
            expect(await test.game.score()).to.equal(3);
        });
        
        it("multiple frames", async function() {
            await test.game.open(1, 2);
            await test.game.open(3, 4);
            const expectedScore = sumReduce(1, 2, 3, 4);
            expect(await test.game.score()).to.equal(expectedScore);
        });

        it("up to 5 frames", async function() {
            await test.game.open(1, 2);
            await test.game.open(3, 4);
            await test.game.open(1, 1);
            await test.game.open(2, 2);
            await test.game.open(3, 3);
            let expectedScore = sumReduce(3, 7, 2, 4, 6);
            expect(await test.game.score()).to.equal(expectedScore);
        });
        it("player throws all gutterballs", async function() {
            await test.playOpenFrames(10, 0, 0);
            expect(await test.game.score()).to.equal(0);
        });
        it("player bowls 3 pins per throw", async function() {
            await test.playOpenFrames(10, 3, 3);
            expect(await test.game.score()).to.equal(60);
        });
    });

    describe("#spare", function() {
        it("player bowls a spare in frame 1", async function() {
            await test.game.spare(4);
            await test.game.open(8, 1);
            await test.playOpenFrames(8, 0, 0);
            const expectedScore = sumReduce(10, 8, 8, 1);
            expect(await test.game.score()).to.equal(expectedScore);
        });
        it("player bowls a spare in frame 8", async function() {
            await test.playOpenFrames(7, 0, 0);
            await test.game.spare(4);
            await test.game.open(4, 5);
            await test.game.open(0, 0);
            const expectedScore = sumReduce(10, 4, 4, 5);
            expect(await test.game.score()).to.equal(expectedScore);
        });
        it("player bowls a spare in frame 10", async function() {
            await test.playOpenFrames(8, 0, 0);
            await test.game.open(4, 5);
            await test.game.bowlTenthFrame(4, 6, 3);
            const expectedScore = sumReduce(9, 10, 3);
            expect(await test.game.score()).to.equal(expectedScore);
        });
        it("player bowls many spares", async function() {
            await test.game.spare(7);
            await test.game.spare(8);
            await test.game.open(3, 4);
            await test.playOpenFrames(7, 0, 0);
            const expectedScore = sumReduce(10, 8, 10, 3, 7);
            expect(await test.game.score()).to.equal(expectedScore);
        });
        it("player bowls many spares with bonus", async function() {
            await test.playOpenFrames(8, 0, 0);
            await test.game.spare(4);
            await test.game.bowlTenthFrame(5, 5, 3);
            const expectedScore = sumReduce(10, 5, 10, 3);
            expect(await test.game.score()).to.equal(expectedScore);
        });
    });

    describe("#strike", function() {
        it("player bowls a strike in frame 1", async function() {
            await test.game.strike();
            await test.game.open(1, 6);
            await test.playOpenFrames(8, 0, 0);
            const expectedScore = sumReduce(10, 1, 6, 1, 6);
            expect(await test.game.score()).to.equal(expectedScore);
        });
        it("player bowls a strike in frame 4", async function() {
            await test.playOpenFrames(3, 0, 0);
            // debugs.fip00(`before test.game.throws===${test.game.throws}`);
            await test.game.strike();
            await test.game.open(4, 2);
            await test.playOpenFrames(5, 0, 0);
            // debugs.fip00(`after test.game.throws===${test.game.throws}`);
            const expectedScore = sumReduce(10, 4, 2, 4, 2);
            expect(await test.game.score()).to.equal(expectedScore);
        });
        it("player bowls a strike in frame 10", async function() {
            await test.playOpenFrames(9, 0, 0);
            await test.game.bowlTenthFrame(10, 10, 10);
            expect(await test.game.score()).to.equal(30);
        });
        it("player bowls perfect game", async function() {
            await test.playMultipleFrames(9, () => test.game.strike());
            await test.game.bowlTenthFrame(10, 10, 10);
            expect(await test.game.score()).to.equal(300);
        });
    });

    describe("#scoreNthFrame", function() {
        /**
         * Define a constant array representing scores for a specifc game.
         * The bowling game will be in this sequence of frames:
         * strike, spare, open-frame, strike, spare, open-frame, open-frame.
         * Note: this is Nth based array (instead of based on N-1); that's why
         * the 0th value is NaN!
         */
        const CALCULATOR_SCORES = {
            strikeSpareOpen: [NaN, 20, 34, 42, 62, 76, 84, 104, 118, 126, 128],
            spareStrikeOpen: [NaN, 20, 38, 46, 66, 84, 92, 112, 130, 138, 158],
            openSpareStrike: [NaN, 8, 28, 46, 54, 74, 92, 100, 120, 150, 180],
            strikeOpenSpare: [NaN, 18, 26, 46, 64, 72, 92, 110, 118, 138, 156],
            strikeGutter: [NaN, 10, 10, 20, 20, 30, 30, 40, 40, 50, 50],
            spareOpenStrike: [NaN, 14, 22, 42, 56, 64, 84, 98, 106, 126, 140],
            openStrikeSpare: [NaN, 8, 28, 42, 50, 70, 84, 92, 112, 126, 134],
        }

        describe("bowls frames in specific sequence strike/spare/open", function() {
            const {strikeSpareOpen} = CALCULATOR_SCORES;
            let framesChain: Promise<void>[];
            beforeEach(function() {
                //Initialize array of promises (but don't resolve yet)
                framesChain = [
                    test.game.strike(),
                    test.game.spare(9),
                    test.game.open(4, 4),
                    test.game.strike(),
                    test.game.spare(9),
                    test.game.open(4, 4),
                    test.game.strike(),
                    test.game.spare(9),
                    test.game.open(4, 4),
                    test.game.open(1, 1),
                ];
            });
            strikeSpareOpen.forEach((score, i) => {
                if (i < 1 || score === NaN || i > 10) {
                    return 'continue-forEach';
                }
                it(`verify calculator score at frame: ${i}`, async function() {
                    //Resolve each promise in order
                    framesChain.forEach(async (frame) => await frame);
                    debugs.fip01(`(score,i)===(${score},${i})`);
                    // debugs.fip01(`...index is ok? (i > 0?)===${i > 0}`);
                    // debugs.fip01(`...index is ok? (i < 11?)===${i < 11}`);
                    const actual = await test.game.scoreNthFrame(i);
                    expect(actual).to.equal(score);
                });
            });
        });

        describe("bowls frames in specific sequence 2: spare/strike/open", function() {
            const { spareStrikeOpen } = CALCULATOR_SCORES;
            let framesChain: Promise<void>[];
            beforeEach(function () {
                //Initialize array of promises (but don't resolve yet)
                framesChain = [
                    test.game.spare(9),
                    test.game.strike(),
                    test.game.open(4, 4),
                    test.game.spare(9),
                    test.game.strike(),
                    test.game.open(4, 4),
                    test.game.spare(9),
                    test.game.strike(),
                    test.game.open(4, 4),
                    test.game.bowlTenthFrame(5, 5, 10)
                ];
            });
            spareStrikeOpen.forEach((score, i) => {
                if (i < 1 || score === NaN || i > 10) {
                    return 'continue-forEach';
                }
                it(`verify calculator score at frame: ${i}`, async function () {
                    framesChain.forEach(async (frame) => await frame);
                    debugs.fip01(`(score,i)===(${score},${i})`);
                    const actual = await test.game.scoreNthFrame(i);
                    expect(actual).to.equal(score);
                });
            });
        });
        
        describe("bowls frames in specific sequence 3: open/spare/strike", function() {
            const { openSpareStrike } = CALCULATOR_SCORES;
            let framesChain: Promise<void>[];
            beforeEach(function () {
                //Initialize array of promises (but don't resolve yet)
                framesChain = [
                    test.game.open(4, 4),
                    test.game.spare(9),
                    test.game.strike(),
                    test.game.open(4, 4),
                    test.game.spare(9),
                    test.game.strike(),
                    test.game.open(4, 4),
                    test.game.spare(9),
                    test.game.strike(),
                    test.game.bowlTenthFrame(10, 10, 10),
                ];
            });
            openSpareStrike.forEach((score, i) => {
                if (i < 1 || score === NaN || i > 10) {
                    return 'continue-forEach';
                }
                it(`verify calculator score at frame: ${i}`, async function () {
                    framesChain.forEach(async (frame) => await frame);
                    debugs.fip01(`(score,i)===(${score},${i})`);
                    const actual = await test.game.scoreNthFrame(i);
                    expect(actual).to.equal(score);
                });
            });
        });
        
        describe("bowls frames in specific sequence 4: strike/open/spare", function() {
            const { strikeOpenSpare } = CALCULATOR_SCORES;
            let framesChain: Promise<void>[];
            beforeEach(function () {
                //Initialize array of promises (but don't resolve yet)
                framesChain = [
                    test.game.strike(),
                    test.game.open(4, 4),
                    test.game.spare(5),
                    test.game.strike(),
                    test.game.open(4, 4),
                    test.game.spare(5),
                    test.game.strike(),
                    test.game.open(4, 4),
                    test.game.spare(5),
                    test.game.bowlTenthFrame(10, 4, 4),
                ];
            });
            strikeOpenSpare.forEach((score, i) => {
                if (i < 1 || score === NaN || i > 10) {
                    return 'continue-forEach';
                }
                it(`verify calculator score at frame: ${i}`, async function () {
                    framesChain.forEach(async (frame) => await frame);
                    debugs.fip01(`(score,i)===(${score},${i})`);
                    const actual = await test.game.scoreNthFrame(i);
                    expect(actual).to.equal(score);
                });
            });
        });

        describe("bowls frames in specific sequence 5: strike/gutter", function() {
            const { strikeGutter } = CALCULATOR_SCORES;
            let framesChain: Promise<void>[];
            beforeEach(function () {
                //Initialize array of promises (but don't resolve yet)
                framesChain = [
                    test.game.strike(),
                    test.game.open(0, 0),
                    test.game.strike(),
                    test.game.open(0, 0),
                    test.game.strike(),
                    test.game.open(0, 0),
                    test.game.strike(),
                    test.game.open(0, 0),
                    test.game.strike(),
                    test.game.bowlTenthFrame(0, 0),
                ];
            });
            strikeGutter.forEach((score, i) => {
                if (i < 1 || score === NaN || i > 10) {
                    return 'continue-forEach';
                }
                it(`verify calculator score at frame: ${i}`, async function () {
                    framesChain.forEach(async (frame) => await frame);
                    debugs.fip01(`(score,i)===(${score},${i})`);
                    const actual = await test.game.scoreNthFrame(i);
                    expect(actual).to.equal(score);
                });
            });
        });

        describe("bowls frames in specific sequence 6: spare/open/strike", function() {
            const { spareOpenStrike } = CALCULATOR_SCORES;
            let framesChain: Promise<void>[];
            beforeEach(function () {
                //Initialize array of promises (but don't resolve yet)
                framesChain = [
                    test.game.spare(5),
                    test.game.open(4, 4),
                    test.game.strike(),
                    test.game.spare(5),
                    test.game.open(4, 4),
                    test.game.strike(),
                    test.game.spare(5),
                    test.game.open(4, 4),
                    test.game.strike(),
                    test.game.bowlTenthFrame(5, 5, 4),
                ];
            });
            spareOpenStrike.forEach((score, i) => {
                if (i < 1 || score === NaN || i > 10) {
                    return 'continue-forEach';
                }
                it(`verify calculator score at frame: ${i}`, async function () {
                    framesChain.forEach(async (frame) => await frame);
                    debugs.fip01(`(score,i)===(${score},${i})`);
                    const actual = await test.game.scoreNthFrame(i);
                    expect(actual).to.equal(score);
                });
            });
        });
        describe("bowls frames in specific sequence 7: open/strike/spare", function() {
            const { openStrikeSpare } = CALCULATOR_SCORES;
            let framesChain: Promise<void>[];
            beforeEach(function () {
                //Initialize array of promises (but don't resolve yet)
                framesChain = [
                    test.game.open(4, 4),
                    test.game.strike(),
                    test.game.spare(5),
                    test.game.open(4, 4),
                    test.game.strike(),
                    test.game.spare(5),
                    test.game.open(4, 4),
                    test.game.strike(),
                    test.game.spare(5),
                    test.game.bowlTenthFrame(4, 4),
                ];
            });
            openStrikeSpare.forEach((score, i) => {
                if (i < 1 || score === NaN || i > 10) {
                    return 'continue-forEach';
                }
                it(`verify calculator score at frame: ${i}`, async function () {
                    framesChain.forEach(async (frame) => await frame);
                    debugs.fip01(`(score,i)===(${score},${i})`);
                    const actual = await test.game.scoreNthFrame(i);
                    expect(actual).to.equal(score);
                });
            });
        });
    });

    xdescribe("#scoreNthFrame - error handling", function () {
        /** Helper function that constructs functions for testing errors */
        let createFn: Function;
        beforeEach(function () {
            createFn = (test: TestSubject, nth: number) => {
                return async function () {
                    await test.game.open(1, 1);
                    await test.game.scoreNthFrame(nth);
                }
            }
        });

        it("expect error; part 0", function () {
            let testFn = createFn(test, 0);
            expect(testFn).to.throw(/array index out of bounds/);
            expect(testFn).to.throw(BowlingGameError);
        });
        it("expect error; part 1", function () {
            let testFn = createFn(test, 9);
            expect(testFn).to.throw(/array index out of bounds/);
            expect(testFn).to.throw(BowlingGameError);
        });
        it("expect error; part 2", function () {
            let testFn = createFn(test, -22);
            expect(testFn).to.throw(/array index out of bounds/);
            expect(testFn).to.throw(BowlingGameError);
        });
        it("clean; no errors", function () {
            let cleanfunc = createFn(test, 1);
            expect(cleanfunc).to.not.throw(/array index out of bounds/);
            expect(cleanfunc).to.not.throw(BowlingGameError);
        });
    });

});