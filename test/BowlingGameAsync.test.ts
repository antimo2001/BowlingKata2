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
         * Function is the iterator for scoreNthFrame testing
         */
        const handleTestCaseForScoreNth = async (score: number, i: number) => {
            if (i <= 0 || score===NaN) {
                return;
            }
            it(`verify calculator score at frame: ${i}`, async function() {
                const actual = await test.game.scoreNthFrame(i);
                expect(actual).to.equal(score);
            });
        }
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
FAILCOMPILE
        describe("TODO: bowls frames in specific sequence strike/spare/open", function() {
            let chain: Promise<void>[];
            beforeEach(function() {
                // debugs.fip01(`...begin game`);
                chain = [
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
                // debugs.fip01(`...END GAME`);
            });
            let i = 0;
            for (let score of CALCULATOR_SCORES.strikeSpareOpen) {
                if (i <= 0 || score === NaN) {
                    continue;
                }
                it(`verify calculator score at frame: ${i}`, function(done) {
                    Promise.all(chain).then(() => {
                        return test.game.scoreNthFrame(i);
                    }).then((actual) => {
                        expect(actual).to.equal(score);
                        done();
                    });
                });
                i += 1;
            }
        });

        xdescribe("bowls frames in specific sequence 2: spare/strike/open", function() {
            beforeEach(async function() {
                // debugs.fip01(`...begin game`);
                await test.game.spare(9);
                await test.game.strike();
                await test.game.open(4, 4);
                await test.game.spare(9);
                await test.game.strike();
                await test.game.open(4, 4);
                await test.game.spare(9);
                await test.game.strike();
                await test.game.open(4, 4);
                await test.game.bowlTenthFrame(5, 5, 10);
                // debugs.fip01(`...END GAME`);
            });
            CALCULATOR_SCORES.spareStrikeOpen.forEach(handleTestCaseForScoreNth);
        });
        
        xdescribe("bowls frames in specific sequence 3: open/spare/strike", function() {
            beforeEach(async function() {
                // debugs.fip01(`...begin game`);
                await test.game.open(4, 4);
                await test.game.spare(9);
                await test.game.strike();
                await test.game.open(4, 4);
                await test.game.spare(9);
                await test.game.strike();
                await test.game.open(4, 4);
                await test.game.spare(9);
                await test.game.strike();
                await test.game.bowlTenthFrame(10, 10, 10);
                // debugs.fip01(`...END GAME`);
            });
            CALCULATOR_SCORES.openSpareStrike.forEach(handleTestCaseForScoreNth);
        });
        
        xdescribe("bowls frames in specific sequence 4: strike/open/spare", function() {
            beforeEach(async function() {
                await test.game.strike();
                await test.game.open(4, 4);
                await test.game.spare(5);
                await test.game.strike();
                await test.game.open(4, 4);
                await test.game.spare(5);
                await test.game.strike();
                await test.game.open(4, 4);
                await test.game.spare(5);
                await test.game.bowlTenthFrame(10, 4, 4);
            });
            CALCULATOR_SCORES.strikeOpenSpare.forEach(handleTestCaseForScoreNth);
        });

        xdescribe("bowls frames in specific sequence 5: strike/gutter", function() {
            beforeEach(async function() {
                await test.playMultipleFrames(4, async () => {
                    await test.game.strike();
                    await test.game.open(0, 0);
                });
                await test.game.strike();
                await test.game.bowlTenthFrame(0, 0);
            });
            CALCULATOR_SCORES.strikeGutter.forEach(handleTestCaseForScoreNth);
        });

        xdescribe("bowls frames in specific sequence 6: spare/open/strike", function() {
            beforeEach(async function() {
                await test.playMultipleFrames(3, async () => {
                    await test.game.spare(5);
                    await test.game.open(4, 4);
                    await test.game.strike();
                });
                await test.game.bowlTenthFrame(5, 5, 4);
            });
            CALCULATOR_SCORES.spareOpenStrike.forEach(handleTestCaseForScoreNth);
        });
        xdescribe("bowls frames in specific sequence 7: open/strike/spare", function() {
            beforeEach(async function() {
                await test.playMultipleFrames(3, async () => {
                    await test.game.open(4, 4);
                    await test.game.strike();
                    await test.game.spare(5);
                });
                await test.game.bowlTenthFrame(4, 4);
            });
            CALCULATOR_SCORES.openStrikeSpare.forEach(handleTestCaseForScoreNth);
        });
    });

    xdescribe("#scoreNthFrame - error handling", function () {
        /** Helper function that constructs functions for testing errors */
        let createFn: Function;
        beforeEach(function () {
            createFn = (test: TestSubject, nth: number) => {
                return function () {
                    test.game.open(1, 1);
                    test.game.scoreNthFrame(nth);
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