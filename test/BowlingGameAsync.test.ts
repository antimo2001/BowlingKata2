import 'mocha';
import chai, { expect } from 'chai';
import chaiAsPromise from 'chai-as-promised';
import debug from 'debug';
import { Utility } from '../src/Utility';
import { Frame } from '../src/Frame';
import { BowlingGameAsync } from '../src/BowlingGameAsync';
import { BowlingGameError } from '../src/BowlingGameError';

//Register the chai-as-promised library
//Note that chaiAsPromise should be the very last registerd plugin
chai.use(chaiAsPromise);

const debugFip = debug("fip01:test:BowlingGameAsync");
//FIP stands for fix in-progress

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
        debugFip(`playMultipleFrames: range===${range}`);
        for await (let i of range) {
            // debugFip(`range[${i}]`);
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

    describe("#scoreNthFrame (simple)", function() {
        it("2 frames", async function() {
            await test.game.open(1, 0);
            await test.game.open(2, 0);
            const NTH_FRAME = 2;
            const s = await test.game.scoreNthFrame(NTH_FRAME);
            expect(s).to.equal(3);
        });
        it("5 frames", async function() {
            await test.game.open(1, 0);
            await test.game.open(1, 0);
            await test.game.open(0, 1);
            await test.game.open(0, 1);
            await test.game.open(0, 5);
            const NTH_FRAME = 5;
            const s = await test.game.scoreNthFrame(NTH_FRAME);
            expect(s).to.equal(4 + 5);
        });
        it("9 frames", async function() {
            await test.game.open(1, 0);
            await test.game.open(1, 0);
            await test.game.open(1, 0);
            await test.game.open(0, 1);
            await test.game.open(0, 1);
            await test.game.open(0, 1);
            await test.game.open(1, 0);
            await test.game.open(1, 0);
            await test.game.open(1, 0);
            const NTH_FRAME = 9;
            const s = await test.game.scoreNthFrame(NTH_FRAME);
            expect(s).to.equal(9);
        });
        it("10 frames", async function() {
            await test.game.open(1, 0);
            await test.game.open(1, 0);
            await test.game.open(1, 0);
            await test.game.open(0, 1);
            await test.game.open(0, 1);
            await test.game.open(0, 1);
            await test.game.open(1, 0);
            await test.game.open(1, 0);
            await test.game.open(1, 0);
            await test.game.bowlTenthFrame(1, 9, 10);
            expect(await test.game.scoreNthFrame(9)).to.equal(9);
            expect(await test.game.scoreNthFrame(10)).to.equal(9 + 20);
        });
        it("10 frames: part 2", async function() {
            await test.game.open(1, 0);
            await test.game.open(1, 0);
            await test.game.open(1, 0);
            await test.game.open(0, 1);
            await test.game.open(0, 1);
            await test.game.open(0, 1);
            await test.game.open(1, 0);
            await test.game.open(1, 0);
            await test.game.open(1, 0);
            await test.game.bowlTenthFrame(1, 9, 10);
            //Loop from 1 to 9 to check the scores
            const frames1thru9 = Utility.range(1, 10);
            for await (let n of frames1thru9) {
                expect(await test.game.scoreNthFrame(n)).to.equal(n);
            }
            expect(await test.game.scoreNthFrame(10)).to.equal(29);
        });
    });

    describe("#scoreNthFrame (iterations)", function () {
        //All of the tests in this describe block do not properly work
        //I think mocha or chai (or both) cannot handle for-await loops yet
        //or maybe something else in this test code is wrong?
        //...yes; I confirmed that a for-await loop surrounding an it() block
        //fails to execute properly (even if the describe block is also async)
        //...so the workaround is to refactor the it block so that the for-await
        //loop is nested inside the it() block; thus, the dynamic naming of the
        //it() block is removed, resulting in a decrease in your count of tests!

        /**
         * Define a constant array representing scores for a specifc game.
         * The bowling game will be in these specific sequences.
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
        };

        describe("bowls frames in specific sequence strike/spare/open", function() {
            const { strikeSpareOpen } = CALCULATOR_SCORES;
            async function initializeAllFrames(test: TestSubject) {
                await test.game.strike();
                await test.game.spare(9);
                await test.game.open(4, 4);
                await test.game.strike();
                await test.game.spare(9);
                await test.game.open(4, 4);
                await test.game.strike();
                await test.game.spare(9);
                await test.game.open(4, 4);
                await test.game.bowlTenthFrame(1, 1);
            }
            it(`verify 10 frames and 10 scores`, async function() {
                await initializeAllFrames(test);
                //Loop thru array of 1 to 10
                const nums = Utility.range(1, 11);
                for await(let i of nums) {
                    const score = strikeSpareOpen[i];
                    debugFip(`(score,i)===(${score},${i})`);
                    const actual = await test.game.scoreNthFrame(i);
                    const msg = `At index ${i}, testcase expected ${actual} to equal ${score}`;
                    await expect(actual).to.equal(score, msg);
                }
            });
        });
        describe("bowls frames in specific sequence 2: spare/strike/open", function() {
            const { spareStrikeOpen } = CALCULATOR_SCORES;
            async function initializeAllFrames(test: TestSubject) {
                await test.game.spare(9);
                await test.game.strike();
                await test.game.open(4, 4);
                await test.game.spare(9);
                await test.game.strike();
                await test.game.open(4, 4);
                await test.game.spare(9);
                await test.game.strike();
                await test.game.open(4, 4);
                await test.game.bowlTenthFrame(1, 9, 10);
            }
            it(`verify 10 frames and 10 scores`, async function () {
                await initializeAllFrames(test);
                //Loop thru array of 1 to 10
                const nums = Utility.range(1, 11);
                for await (let i of nums) {
                    const score = spareStrikeOpen[i];
                    debugFip(`(score,i)===(${score},${i})`);
                    const actual = await test.game.scoreNthFrame(i);
                    const msg = `At index ${i}, testcase expected ${actual} to equal ${score}`;
                    await expect(actual).to.equal(score, msg);
                }
            });
        });
        describe("bowls frames in specific sequence 3: open/spare/strike", function() {
            const { openSpareStrike } = CALCULATOR_SCORES;
            async function initializeAllFrames(test: TestSubject) {
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
            }
            it(`verify 10 frames and 10 scores`, async function () {
                await initializeAllFrames(test);
                const nums = Utility.range(1, 11);
                for await (let i of nums) {
                    const score = openSpareStrike[i];
                    debugFip(`(score,i)===(${score},${i})`);
                    const actual = await test.game.scoreNthFrame(i);
                    const msg = `At index ${i}, testcase expected ${actual} to equal ${score}`;
                    await expect(actual).to.equal(score, msg);
                }
            });
        });
        describe("bowls frames in specific sequence 4: strike/open/spare", function () {
            const { strikeOpenSpare } = CALCULATOR_SCORES;
            async function initializeAllFrames(test: TestSubject) {
                await test.game.strike();
                await test.game.open(4, 4);
                await test.game.spare(9);
                await test.game.strike();
                await test.game.open(4, 4);
                await test.game.spare(9);
                await test.game.strike();
                await test.game.open(4, 4);
                await test.game.spare(9);
                await test.game.bowlTenthFrame(10, 4, 4);
            }
            it(`verify 10 frames and 10 scores`, async function () {
                await initializeAllFrames(test);
                const nums = Utility.range(1, 11);
                for await (let i of nums) {
                    const score = strikeOpenSpare[i];
                    debugFip(`(score,i)===(${score},${i})`);
                    const actual = await test.game.scoreNthFrame(i);
                    const msg = `At index ${i}, testcase expected ${actual} to equal ${score}`;
                    await expect(actual).to.equal(score, msg);
                }
            });
        });
        describe("bowls frames in specific sequence 5: strike/gutter", function () {
            const { strikeGutter } = CALCULATOR_SCORES;
            async function initializeAllFrames(test: TestSubject) {
                await test.game.strike();
                await test.game.open(0, 0);
                await test.game.strike();
                await test.game.open(0, 0);
                await test.game.strike();
                await test.game.open(0, 0);
                await test.game.strike();
                await test.game.open(0, 0);
                await test.game.strike();
                await test.game.bowlTenthFrame(0, 0);
            }
            it(`verify 10 frames and 10 scores`, async function () {
                await initializeAllFrames(test);
                const nums = Utility.range(1, 11);
                for await (let i of nums) {
                    const score = strikeGutter[i];
                    debugFip(`(score,i)===(${score},${i})`);
                    const actual = await test.game.scoreNthFrame(i);
                    const msg = `At index ${i}, testcase expected ${actual} to equal ${score}`;
                    await expect(actual).to.equal(score, msg);
                }
            });
        });
        describe("bowls frames in specific sequence 6: spare/open/strike", function () {
            const { spareOpenStrike } = CALCULATOR_SCORES;
            async function initializeAllFrames(test: TestSubject) {
                await test.game.spare(9);
                await test.game.open(4, 4);
                await test.game.strike();
                await test.game.spare(9);
                await test.game.open(4, 4);
                await test.game.strike();
                await test.game.spare(9);
                await test.game.open(4, 4);
                await test.game.strike();
                await test.game.bowlTenthFrame(4, 6, 4);
            }
            it(`verify 10 frames and 10 scores`, async function () {
                await initializeAllFrames(test);
                const nums = Utility.range(1, 11);
                for await (let i of nums) {
                    const score = spareOpenStrike[i];
                    debugFip(`(score,i)===(${score},${i})`);
                    const actual = await test.game.scoreNthFrame(i);
                    const msg = `At index ${i}, testcase expected ${actual} to equal ${score}`;
                    await expect(actual).to.equal(score, msg);
                }
            });
        });
        describe("bowls frames in specific sequence 7: open/strike/spare", function () {
            const { openStrikeSpare } = CALCULATOR_SCORES;
            async function initializeAllFrames(test: TestSubject) {
                await test.game.open(4, 4);
                await test.game.strike();
                await test.game.spare(9);
                await test.game.open(4, 4);
                await test.game.strike();
                await test.game.spare(9);
                await test.game.open(4, 4);
                await test.game.strike();
                await test.game.spare(9);
                await test.game.bowlTenthFrame(4, 4);
            }
            it(`verify 10 frames and 10 scores`, async function () {
                await initializeAllFrames(test);
                const nums = Utility.range(1, 11);
                for await (let i of nums) {
                    const score = openStrikeSpare[i];
                    debugFip(`(score,i)===(${score},${i})`);
                    const actual = await test.game.scoreNthFrame(i);
                    const msg = `At index ${i}, testcase expected ${actual} to equal ${score}`;
                    await expect(actual).to.equal(score, msg);
                }
            });
        });
    });

    describe("#scoreNthFrame (error handling)",  function () {
        /** Initialize the test-subject with only 1 frame in the game */
        async function initializeSingleFrame(test: TestSubject) {
            await test.game.open(1, 1).catch(err => {
                debugFip(`test suite found unexpected error: ${err}`);
                throw err;
            });
        }

        /** Execute the expectations and assertions for error-handling */
        async function executeAssertions(test: TestSubject, nthFrame: number) {
            try {
                await test.game.scoreNthFrame(nthFrame);
                throw new chai.AssertionError(`test suite expected error but none found`);
            }
            catch (err) {
                expect(err).to.matches(/score is not defined for nthFrame/);
                expect(err).instanceOf(BowlingGameError);
            }
        }

        it("expect error; part ", async function () {
            await initializeSingleFrame(test);
            await executeAssertions(test, 0);
        });
        it("expect error; part 1", async function () {
            await initializeSingleFrame(test);
            await executeAssertions(test, 9);
        });
        it("expect error; part 2", async function () {
            await initializeSingleFrame(test);
            await executeAssertions(test, -22);
        });
        it("expect error; part 3", async function () {
            await initializeSingleFrame(test);
            await executeAssertions(test, 333);
        });
    });

});