import 'mocha';
import debug from 'debug';
import { expect } from 'chai';
import { Frame } from '../src/Frame';
import { BowlingGame, BowlingGameError } from '../src/BowlingGame';

/** Helper functions for debugging other fixes in-progress */
const debugs = {
    fip00: debug("fip00:test:BowlingGame"),
    fip01: debug("fip01:test:BowlingGame"),
    //FYI: FIP stands for fix in-progress
};

/** Helper function for calculating the sum */
const sumReduce = Frame.sum;

class TestSubject {
    public game: BowlingGame;
    constructor() {
        this.game = new BowlingGame();
    }
    /**
     * Helper function is used to execute multiple open-frames for a game
     * @param frameTotalCount number of loops
     * @param throw1 number of pins knocked down in the 1st throw
     * @param throw2 number of pins knocked down in the 2nd throw
     */
    playOpenFrames(frameTotalCount: number, throw1: number, throw2: number): void {
        for (let i = 0; i < frameTotalCount; i++) {
            this.game.open(throw1, throw2);
        }
    }
    /**
     * Helper function is for invoking multiple frames (of any type) for a game
     * @param loopCount the number of times to iterate
     * @param iterator the callback function to repeatedly invoke
     */
    playMultipleFrames(loopCount: number, iterator: (game: BowlingGame) => void): void {
        for (let i = 0; i < loopCount; i++) {
            iterator.call(this, this.game);
        }
    }
}

describe("BowlingGame", function() {
    let test: TestSubject;

    beforeEach(function() {
        test = new TestSubject();
    });

    describe("#openFrame", function() {
        it("single frame", function() {
            test.game.open(1, 2);
            expect(test.game.score()).to.equal(3);
        });

        it("multiple frames", function() {
            test.game.open(1, 2);
            test.game.open(3, 4);
            const expectedScore = sumReduce(1, 2, 3, 4);
            expect(test.game.score()).to.equal(expectedScore);
        });

        it("up to 5 frames", function() {
            test.game.open(1, 2);
            test.game.open(3, 4);
            test.game.open(1, 1);
            test.game.open(2, 2);
            test.game.open(3, 3);
            let expectedScore = sumReduce(3, 7, 2, 4, 6);
            expect(test.game.score()).to.equal(expectedScore);
        });
        it("player throws all gutterballs", function() {
            test.playOpenFrames(10, 0, 0);
            expect(test.game.score()).to.equal(0);
        });
        it("player bowls 3 pins per throw", function() {
            test.playOpenFrames(10, 3, 3);
            expect(test.game.score()).to.equal(60);
        });
    });

    describe("#spare", function() {
        it("player bowls a spare in frame 1", function() {
            test.game.spare(4);
            test.game.open(8, 1);
            test.playOpenFrames(8, 0, 0);
            const expectedScore = sumReduce(10, 8, 8, 1);
            expect(test.game.score()).to.equal(expectedScore);
        });
        it("player bowls a spare in frame 8", function() {
            test.playOpenFrames(7, 0, 0);
            test.game.spare(4);
            test.game.open(4, 5);
            test.game.open(0, 0);
            const expectedScore = sumReduce(10, 4, 4, 5);
            expect(test.game.score()).to.equal(expectedScore);
        });
        it("player bowls a spare in frame 10", function() {
            test.playOpenFrames(8, 0, 0);
            test.game.open(4, 5);
            test.game.bowlTenthFrame(4, 6, 3);
            const expectedScore = sumReduce(9, 10, 3);
            expect(test.game.score()).to.equal(expectedScore);
        });
        it("player bowls many spares", function() {
            test.game.spare(7);
            test.game.spare(8);
            test.game.open(3, 4);
            test.playOpenFrames(7, 0, 0);
            const expectedScore = sumReduce(10, 8, 10, 3, 7);
            expect(test.game.score()).to.equal(expectedScore);
        });
        it("player bowls many spares with bonus", function() {
            test.playOpenFrames(8, 0, 0);
            test.game.spare(4);
            test.game.bowlTenthFrame(5, 5, 3);
            const expectedScore = sumReduce(10, 5, 10, 3);
            expect(test.game.score()).to.equal(expectedScore);
        });
    });

    describe("#strike", function() {
        it("player bowls a strike in frame 1", function() {
            test.game.strike();
            test.game.open(1, 6);
            test.playOpenFrames(8, 0, 0);
            const expectedScore = sumReduce(10, 1, 6, 1, 6);
            expect(test.game.score()).to.equal(expectedScore);
        });
        it("player bowls a strike in frame 4", function() {
            test.playOpenFrames(3, 0, 0);
            // debugs.fip00(`before test.game.throws===${test.game.throws}`);
            test.game.strike();
            test.game.open(4, 2);
            test.playOpenFrames(5, 0, 0);
            // debugs.fip00(`after test.game.throws===${test.game.throws}`);
            const expectedScore = sumReduce(10, 4, 2, 4, 2);
            expect(test.game.score()).to.equal(expectedScore);
        });
        it("player bowls a strike in frame 10", function() {
            test.playOpenFrames(9, 0, 0);
            test.game.bowlTenthFrame(10, 10, 10);
            expect(test.game.score()).to.equal(30);
        });
        it("player bowls perfect game", function() {
            test.playMultipleFrames(9, (g: BowlingGame) => g.strike());
            test.game.bowlTenthFrame(10, 10, 10);
            expect(test.game.score()).to.equal(300);
        });
    });

    describe("#mixture of frames", function() {
        it("player bowls alternating strikes & spares", function() {
            //Simulate a game where a player alternates between strike/spare
            test.playMultipleFrames(4, (game: BowlingGame) => {
                game.strike();
                game.spare(5);
            });
            test.game.strike();
            test.game.bowlTenthFrame(5, 5, 10);
            expect(test.game.score()).to.equal(200);
        });
        it("player bowls alternating spares & strikes", function() {
            //Simulate a game where a player alternates between spares/strikes
            test.playMultipleFrames(4, (game: BowlingGame) => {
                game.spare(8);
                game.strike();
            });
            test.game.spare(5);
            test.game.bowlTenthFrame(10, 5, 5);
            expect(test.game.score()).to.equal(200);
        });
        it("player bowls 1 strike and 1 spare, no bonus", function() {
            test.playOpenFrames(3, 1, 1);
            test.game.strike();
            test.game.spare(4);
            test.playOpenFrames(5, 1, 2);
            let firstFrames = 3 * 2;
            let lastFrames = 5 * 3;
            let middleFrames = sumReduce(10, 4, 6, 10, 1);
            let expectedScore = sumReduce(firstFrames, lastFrames, middleFrames);
            expect(test.game.score()).to.equal(expectedScore);
        });
        it("player bowls many strikes and spares, no bonus", function() {
            test.playOpenFrames(3, 2, 0);
            test.game.strike();
            test.game.strike();
            test.game.spare(4);
            test.game.spare(7);
            test.game.open(1, 1);
            test.game.open(5, 0);
            test.game.open(5, 0);
            let expectedScore: number;
            {
                //Show all the math for 100% confidence in the total
                let first = 3 * 2;
                let strike1 = sumReduce(10, 10, 4);
                let strike2 = sumReduce(10, 4, 6);
                let spare1 = sumReduce(4, 6, 7);
                let spare2 = sumReduce(7, 3, 1);
                let mid = sumReduce(strike1, strike2, spare1, spare2, 1, 1);
                let last = 2 * 5;
                expectedScore = sumReduce(first, mid, last);
                //Also tested with online bowling calculator: www.bowlinggenius.com
                debugs.fip00(`expectedScore===${expectedScore}`);
                debugs.fip00(`is expectedScore===90? ${90 === expectedScore? "yes": "OH NO"}`);
            }
            expect(test.game.score()).to.equal(expectedScore);
        });
        it("player bowls many strikes and spares, yes bonus", function() {
            test.playOpenFrames(6, 2, 0);
            test.game.strike();
            test.game.spare(4);
            test.game.spare(7);
            test.game.bowlTenthFrame(10, 9, 1);
            let expectedScore: number;
            {
                //Show all the math for 100% confidence in the total
                let first = 6 * 2;
                let strike1 = sumReduce(10, 4, 6);
                let spare1 = sumReduce(4, 6, 7);
                let spare2 = sumReduce(7, 3, 10);
                let strike2 = sumReduce(10, 9, 1);
                expectedScore = sumReduce(first, strike1, spare1, spare2, strike2);
                debugs.fip00(`expectedScore===${expectedScore}`);
                debugs.fip00(`is expectedScore===89? ${89 === expectedScore ? "yes" : "OH NO"}`);
            }
            expect(test.game.score()).to.equal(expectedScore);
        });
        it("player bowls alternating frames of strike/spare/open", function() {
            test.playMultipleFrames(3, (game: BowlingGame) => {
                game.strike();
                game.spare(9);
                game.open(4, 4);
            });
            test.game.open(4, 5);
            //Show all the math for 100% confidence in the total
            let expectedScore = sumReduce(10, 9, 1);
            expectedScore += sumReduce(9, 1, 4);
            expectedScore += sumReduce(4, 4);
            expectedScore *= 3;
            expectedScore += sumReduce(4, 5);
            expect(test.game.score()).to.equal(expectedScore);
        });
    });

    describe("#scoreNthFrame", function() {
        describe("when it fails", function() {
            /** Helper function that constructs functions for testing errors */
            let createFn: Function;
            beforeEach(function() {
                createFn = (test: TestSubject, nth: number) => {
                    return function() {
                        test.game.open(1, 1);
                        test.game.scoreNthFrame(nth);
                    }
                }
            });

            it("expect error; part 0", function() {
                let testFn = createFn(test, 0);
                expect(testFn).to.throw(/array index out of bounds/);
                expect(testFn).to.throw(BowlingGameError);
            });
            it("expect error; part 1", function() {
                let testFn = createFn(test, 9);
                expect(testFn).to.throw(/array index out of bounds/);
                expect(testFn).to.throw(BowlingGameError);
            });
            it("expect error; part 2", function() {
                let testFn = createFn(test, -22);
                expect(testFn).to.throw(/array index out of bounds/);
                expect(testFn).to.throw(BowlingGameError);
            });
            it("clean; no errors", function() {
                let cleanfunc = createFn(test, 1);
                expect(cleanfunc).to.not.throw(/array index out of bounds/);
                expect(cleanfunc).to.not.throw(BowlingGameError);
            });
        });

        describe("bowls frames in specific sequence strike/spare/open", function() {
            /**
             * Define a constant array representing scores for a specifc game.
             * The bowling game will be in this sequence of frames:
             * strike, spare, open-frame, strike, spare, open-frame, open-frame.
             * Note: this is Nth based array (instead of based on N-1); that's why
             * the 0th value is NaN!
             */
            const calculatorScores = [NaN, 20, 34, 42, 62, 76, 84, 104, 118, 126, 128];
            
            beforeEach(function() {
                // debugs.fip00(`...begin game`);
                test.game.strike();
                test.game.spare(9);
                test.game.open(4, 4);
                // const scoreAtFrame3 = test.game.score();
                // debugs.fip00(`scoreAtFrame3===${scoreAtFrame3}; and is 42? (${42 === scoreAtFrame3})`);
                test.game.strike();
                test.game.spare(9);
                test.game.open(4, 4);
                // const scoreAtFrame6 = test.game.score();
                // debugs.fip00(`scoreAtFrame6===${scoreAtFrame6}; and is 84? (${84 === scoreAtFrame6})`);
                test.game.strike();
                test.game.spare(9);
                test.game.open(4, 4);
                // const scoreAtFrame9 = test.game.score();
                // debugs.fip00(`scoreAtFrame9===${scoreAtFrame9}; and is 126? (${126 === scoreAtFrame9})`);
                test.game.open(1, 1);
                debugs.fip00(`...END GAME`);
            });

            calculatorScores.forEach((score, i) => {
                if (i <= 0) {
                    return;
                }
                it(`verify calculator (${score}) at frame: ${i}`, function() {
                    expect(test.game.scoreNthFrame(i)).to.equal(score);
                });
            });
        });

        describe("bowls frames in specific sequence 2: spare/strike/open", function() {
            /**
             * Define a constant array representing scores for a specifc game.
             * Note: this is Nth based array (instead of based on N-1); that's why
             * the 0th value is NaN!
             */
            const calculatorScores = [NaN, 20, 38, 46, 66, 84, 92, 112, 130, 138, 158];

            beforeEach(function() {
                // debugs.fip01(`...begin game`);
                test.game.spare(9);
                test.game.strike();
                test.game.open(4, 4);
                test.game.spare(9);
                test.game.strike();
                test.game.open(4, 4);
                test.game.spare(9);
                test.game.strike();
                test.game.open(4, 4);
                // const scoreAtFrame9 = test.game.score();
                // debugs.fip01(`scoreAtFrame9===${scoreAtFrame9}; and is 138? (${138 === scoreAtFrame9})`);
                test.game.bowlTenthFrame(5, 5, 10);
                // debugs.fip01(`...END GAME`);
            });

            calculatorScores.forEach((score, i) => {
                if (i <= 0) {
                    return;
                }
                it(`verify calculator score at frame: ${i}`, function() {
                    expect(test.game.scoreNthFrame(i)).to.equal(score);
                });
            });
        });

        describe("bowls frames in specific sequence 3: open/spare/strike", function() {
            /**
             * This is Nth based (instead of N-1); that's why NaN is the 0th value
             */
            const calculatorScores = [NaN, 8, 28, 46, 54, 74, 92, 100, 120, 150, 180];

            beforeEach(function() {
                // debugs.fip01(`...begin game`);
                test.game.open(4, 4);
                test.game.spare(9);
                test.game.strike();
                test.game.open(4, 4);
                test.game.spare(9);
                test.game.strike();
                test.game.open(4, 4);
                test.game.spare(9);
                test.game.strike();
                test.game.bowlTenthFrame(10, 10, 10);
                // debugs.fip01(`...END GAME`);
            });

            calculatorScores.forEach((score, i) => {
                if (i <= 0) {
                    return;
                }
                it(`verify calculator score at frame: ${i}`, function() {
                    expect(test.game.scoreNthFrame(i)).to.equal(score);
                });
            });
        });

        describe("bowls frames in specific sequence 4: strike/open/spare", function() {
            /**
             * This is Nth based (instead of N-1); that's why NaN is the 0th value
             */
            const calculatorScores = [NaN, 18, 26, 46, 64, 72, 92, 110, 118, 138, 156];

            beforeEach(function() {
                test.game.strike();
                test.game.open(4, 4);
                test.game.spare(5);
                test.game.strike();
                test.game.open(4, 4);
                test.game.spare(5);
                test.game.strike();
                test.game.open(4, 4);
                test.game.spare(5);
                test.game.bowlTenthFrame(10, 4, 4);
            });

            calculatorScores.forEach((score, i) => {
                if (i <= 0) {
                    return;
                }
                it(`verify calculator score at frame: ${i}`, function() {
                    expect(test.game.scoreNthFrame(i)).to.equal(score);
                });
            });
        });

        describe("bowls frames in specific sequence 5: strike/gutter", function() {
            /**
             * This is Nth based (instead of N-1); that's why NaN is the 0th value
             */
            const calculatorScores = [NaN, 10, 10, 20, 20, 30, 30, 40, 40, 50, 50];

            beforeEach(function() {
                test.playMultipleFrames(4, (game: BowlingGame) => {
                    game.strike();
                    game.open(0, 0);
                });
                test.game.strike();
                test.game.bowlTenthFrame(0, 0);
            });

            calculatorScores.forEach((score, i) => {
                if (i <= 0) {
                    return;
                }
                it(`verify calculator score at frame: ${i}`, function() {
                    expect(test.game.scoreNthFrame(i)).to.equal(score);
                });
            });
        });

        describe("bowls frames in specific sequence 6: spare/open/strike", function() {
            const calculatorScores = [NaN, 14, 22, 42, 56, 64, 84, 98, 106, 126, 140];

            beforeEach(function() {
                test.playMultipleFrames(3, (game: BowlingGame) => {
                    game.spare(5);
                    game.open(4, 4);
                    game.strike();
                });
                test.game.bowlTenthFrame(5, 5, 4);
            });

            calculatorScores.forEach((score, i) => {
                if (i <= 0) {
                    return;
                }
                it(`verify calculator score at frame: ${i}`, function() {
                    expect(test.game.scoreNthFrame(i)).to.equal(score);
                });
            });
        });
        describe("bowls frames in specific sequence 7: open/strike/spare", function() {
            const calculatorScores = [NaN, 8, 28, 42, 50, 70, 84, 92, 112, 126, 134];

            beforeEach(function() {
                test.playMultipleFrames(3, (game: BowlingGame) => {
                    game.open(4, 4);
                    game.strike();
                    game.spare(5);
                });
                test.game.bowlTenthFrame(4, 4);
            });

            calculatorScores.forEach((score, i) => {
                if (i <= 0) {
                    return;
                }
                it(`verify calculator score at frame: ${i}`, function() {
                    expect(test.game.scoreNthFrame(i)).to.equal(score);
                });
            });
        });
    });

    describe("Edge Tests", function() {
        //WARN: using arrow functions is **discouraged** because the test-suite
        //context is not properly binded anymore
        //Thus, using `this.slow` or `this.timeout` causes errors in typescript!
        //See details online: https://github.com/mochajs/mocha/issues/2018
        // const suite: Mocha.Suite = this;
        // suite.timeout(2000);

        describe("when game is only open frames", function() {
            it("throws of 1-10 pins", function() {
                test.game.open(1, 1);
                test.game.open(1, 2);
                test.game.open(1, 3);
                test.game.open(2, 4);
                test.game.open(2, 5);
                let expectedScore = sumReduce(2, 3, 4, 6, 7);
                expect(test.game.score()).to.equal(expectedScore);
                expect(test.game.scoreNthFrame(5)).to.equal(expectedScore);
                test.game.open(2, 6);
                test.game.open(2, 7);
                test.game.open(1, 8);
                expectedScore += sumReduce(8, 9, 9);
                expect(test.game.score()).to.equal(expectedScore);
                expect(test.game.scoreNthFrame(8)).to.equal(expectedScore);
            });
            it("fails with error when 11+ pins", function() {
                let evilfunc = function() {
                    test.game.open(1, 11);
                    test.game.open(2, 22);
                }
                expect(evilfunc).to.throw(/2 throws cannot exceed 10 pins/);
                expect(evilfunc).to.throw(BowlingGameError);
            });
            it("when 99 frames", function() {
                const LOTSA_FRAMES = 99;
                test.playOpenFrames(LOTSA_FRAMES, 0, 1);
                expect(test.game.frames.length).to.equal(LOTSA_FRAMES);
                expect(test.game.score()).to.equal(LOTSA_FRAMES);
            });
            it("when 5999 frames", function(done) {
                //Disable the timeout for this slow test
                this.timeout(0);
                const LOTSA_FRAMES = 5999;
                test.playOpenFrames(LOTSA_FRAMES, 0, 1);
                expect(test.game.frames.length).to.equal(LOTSA_FRAMES);
                expect(test.game.score()).to.equal(LOTSA_FRAMES);
                setTimeout(done, 50);
            });
            it("fails with error when open frame and negative pins", function() {
                let evilfunc = () => test.game.open(1, -3);
                expect(evilfunc).to.throw(/throw cannot be negative/);
                expect(evilfunc).to.throw(BowlingGameError);
            });
            it("fails with error when 10th frame and negative pins", function() {
                let evilfunc = function() {
                    test.game.spare(3);
                    test.game.bowlTenthFrame(1, -9);
                }
                expect(evilfunc).to.throw(/throw cannot be negative/);
                expect(evilfunc).to.throw(BowlingGameError);
            });
        });

        describe("only spare frames", function() {
            const calculatorGames = {
                part1: [NaN, 15, 30, 45, 55, 55],
                part2: [NaN, 15, 30, 45, 60, 75, 90, 105, 120, 130, 130],
            };

            calculatorGames.part1.forEach((score, i) => {
                if (i <= 0) {
                    return;
                }
                it(`part 1-${i}: when 4 spares and gutter balls`, function() {
                    test.game.spare(5);
                    test.game.spare(5);
                    test.game.spare(5);
                    test.game.spare(5);
                    test.game.open(0, 0);
                    expect(test.game.scoreNthFrame(i)).to.equal(score);
                });
            });

            calculatorGames.part2.forEach((score, i) => {
                if (i <= 0) {
                    return;
                }
                it(`part 2-${i}: when 9 spares and gutter balls`, function() {
                    test.playMultipleFrames(9, (game: BowlingGame) => {
                        game.spare(5);
                    });
                    test.game.open(0, 0);
                    expect(test.game.scoreNthFrame(i)).to.equal(score);
                });
            });

            it("spares with throws of 11+ pins", function() {
                let evilfunc = () => test.game.spare(11);
                expect(evilfunc).to.throw(/first throw of a spare cannot exceed 10/);
                expect(evilfunc).to.throw(BowlingGameError);
            });
            it("fails with error when spare frame and negative pins", function() {
                let evilfunc = () => test.game.spare(-2);
                expect(evilfunc).to.throw(/throw cannot be negative/);
                expect(evilfunc).to.throw(BowlingGameError);
            });
        });
    });

});