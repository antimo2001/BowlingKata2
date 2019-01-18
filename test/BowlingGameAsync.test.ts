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
            const nths = Utility.range(1, 10);
            for await (let n of nths) {
                expect(await test.game.scoreNthFrame(n)).to.equal(n);
            }
            expect(await test.game.scoreNthFrame(10)).to.equal(29);
        });
    });

    xdescribe("#scoreNthFrame (iterations)", function () {
        //NTS: all of the tests in this describe block do not properly work
        //I think mocha or chai (or both) cannot handle for-await loops yet
        //or maybe something else in this test code is wrong??
        //why would a simple stall() cause these to throw UnhandlePromiseRejected exceptions?

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

        xdescribe("bowls frames in specific sequence strike/spare/open", async function() {
            const {strikeSpareOpen} = CALCULATOR_SCORES;
            const nums = Utility.range(1, 2);
            for await (let i of nums) {
                let score = strikeSpareOpen[i];
                it(`verify calculator score at frame: ${i}`, async function() {
                    test = new TestSubject();
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
                    debugFip(`(score,i)===(${score},${i})`);
                    const actual = await test.game.scoreNthFrame(i);
                    return expect(actual).to.equal(score);
                });
            }
        });

        xdescribe("bowls frames in specific sequence 2: spare/strike/open", function() {
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
            for (let i = 1; i <= 10; i++) {
                let score = spareStrikeOpen[i];
                it(`verify calculator score at frame: ${i}`, async function () {
                    framesChain.forEach(f => Promise.resolve(f));
                    const actual = await test.game.scoreNthFrame(i);
                    expect(actual).to.equal(score);
                });
            }
        });
        
        xdescribe("bowls frames in specific sequence 3: open/spare/strike", function() {
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
            for (let i = 1; i <= 10; i++) {
                let score = openSpareStrike[i];
                it(`verify calculator score at frame: ${i}`, async function () {
                    framesChain.forEach(f => Promise.resolve(f));
                    const actual = await test.game.scoreNthFrame(i);
                    expect(actual).to.equal(score);
                });
            }
        });
        
        xdescribe("bowls frames in specific sequence 4: strike/open/spare", function() {
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
            for (let i = 1; i <= 10; i++) {
                let score = strikeOpenSpare[i];
                it(`verify calculator score at frame: ${i}`, async function () {
                    framesChain.forEach(f => Promise.resolve(f));
                    const actual = await test.game.scoreNthFrame(i);
                    expect(actual).to.equal(score);
                });
            }
        });

        xdescribe("bowls frames in specific sequence 5: strike/gutter", function() {
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
            for (let i = 1; i <= 10; i++) {
                let score = strikeGutter[i];
                it(`verify calculator score at frame: ${i}`, async function () {
                    framesChain.forEach(f => Promise.resolve(f));
                    const actual = await test.game.scoreNthFrame(i);
                    expect(actual).to.equal(score);
                });
            }
        });

        xdescribe("bowls frames in specific sequence 6: spare/open/strike", function() {
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
            for (let i = 1; i <= 10; i++) {
                let score = spareOpenStrike[i];
                it(`verify calculator score at frame: ${i}`, async function () {
                    framesChain.forEach(f => Promise.resolve(f));
                    const actual = await test.game.scoreNthFrame(i);
                    expect(actual).to.equal(score);
                });
            }
        });
        xdescribe("bowls frames in specific sequence 7: open/strike/spare", function() {
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
            for (let i = 1; i <= 10; i++) {
                let score = openStrikeSpare[i];
                it(`verify calculator score at frame: ${i}`, async function () {
                    framesChain.forEach(f => Promise.resolve(f));
                    const actual = await test.game.scoreNthFrame(i);
                    expect(actual).to.equal(score);
                });
            }
        });
    });

    describe("#scoreNthFrame - error handling", function () {
        it("expect error; part 0", function (done) {
            const NTH_FRAME = 0;
            test.game.open(1, 1).then(() => {
                test.game.scoreNthFrame(NTH_FRAME).catch(err => {
                    expect(err).to.matches(/array index out of bounds/);
                    expect(err).to.instanceOf(Error);
                });
            }).catch(err => {
                throw `***Unexpected error: ${err}`;
            }).finally(done);
            /*
            This line works but it seems like ts-node receives the error
            expect(test.game.scoreNthFrame(0)).to.eventually.throw(/array index out of bounds/);
            */
        });
        it("expect error; part 1", function (done) {
            const NTH_FRAME = 9;
            test.game.open(1, 1).then(() => {
                test.game.scoreNthFrame(NTH_FRAME).catch(err => {
                    expect(err).to.matches(/array index out of bounds/);
                    expect(err).to.instanceOf(BowlingGameError);
                });
            }).catch(err => {
                throw `***Unexpected error: ${err}`;
            }).finally(done);
        });
        it("expect error; part 2", function (done) {
            const NTH_FRAME = -22;
            test.game.open(1, 1).then(() => {
                test.game.scoreNthFrame(NTH_FRAME).catch(err => {
                    expect(err).to.matches(/array index out of bounds/);
                    expect(err).to.instanceOf(BowlingGameError);
                });
            }).catch(err => {
                throw `***Unexpected error: ${err}`;
            }).finally(done);
        });
        it("expect error; part 3", async function () {
            //Retry using async and without using the done callback
            const NTH_FRAME = 333;
            await test.game.open(1, 1).catch(err => {
                debugFip(`!!!Unexpected error in unit test BowlingGameAsync.test!!! ${err}`);
                throw err;
            });
            try {
                await test.game.scoreNthFrame(NTH_FRAME);
            }
            catch (err) {
                if (err) {
                    expect(err).to.matches(/array index out of bounds/);
                    expect(err).instanceOf(BowlingGameError);
                }
                else {
                    debugFip(`!!!Unexpected error in unit test BowlingGameAsync.test!!! ${err}`);
                    throw err;
                }
            }

            ///NTS: on 2nd thought, the above code is uglier than below code...
            // test.game.open(1, 1).then(() => {
            //     test.game.scoreNthFrame(NTH_FRAME).catch(err => {
            //         expect(err).to.matches(/array index out of bounds/);
            //         expect(err).to.instanceOf(BowlingGameError);
            //     });
            // }).catch(err => {
            //     throw `***Unexpected error: ${err}`;
            // }).finally(done);
        });
    });

});