import 'mocha';
import debug from 'debug';
import { expect } from 'chai';
import { Utility } from '../../src/Utility';
import { BowlingGame } from '../../src/models/BowlingGame';
import { BowlingGameError } from '../../src/models/BowlingGameError';

/**
 * Helper functions for debugging other fixes in-progress
 */
const debugs = {
    fip00: debug("fip00:test:BowlingGame"),
    fip01: debug("fip01:test:BowlingGame"),
    //FYI: FIP stands for fix in-progress
};

const sumReduce = Utility.sum;

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

describe("BowlingGame", () => {
    let test: TestSubject;

    beforeEach(() => {
        test = new TestSubject();
    });

    describe("#open", () => {
        it("1 frame", () => {
            test.game.open(1, 2);
            expect(test.game.score()).to.equal(3);
        });
        it("2 frames", () => {
            test.game.open(1, 2);
            test.game.open(3, 4);
            const expectedScore = sumReduce(1, 2, 3, 4);
            expect(test.game.score()).to.equal(expectedScore);
        });
        it("5 frames", () => {
            test.game.open(1, 2);
            test.game.open(3, 4);
            test.game.open(1, 1);
            test.game.open(2, 2);
            test.game.open(3, 3);
            let expectedScore = sumReduce(3, 7, 2, 4, 6);
            expect(test.game.score()).to.equal(expectedScore);
        });
        it("player throws all gutterballs", () => {
            test.playOpenFrames(10, 0, 0);
            expect(test.game.score()).to.equal(0);
        });
        it("player bowls 3 pins per throw", () => {
            test.playOpenFrames(10, 3, 3);
            expect(test.game.score()).to.equal(60);
        });
        it("throws of 1-10 pins", () => {
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

        describe("Edge cases", () => {
            //WARN: using arrow functions is **discouraged** because the test-suite
            //context is not properly binded anymore
            //Thus, using `this.slow` or `this.timeout` causes errors in typescript!
            //See details online: https://github.com/mochajs/mocha/issues/2018

            it("when 99 frames", () => {
                const LOTSA_FRAMES = 99;
                test.playOpenFrames(LOTSA_FRAMES, 0, 1);
                expect(test.game.score()).to.equal(LOTSA_FRAMES);
            });
            it("when 1999 frames", function(done) {
                //Disable the timeout for this slow test
                this.timeout(0);
                const LOTSA_FRAMES = 1999;
                test.playOpenFrames(LOTSA_FRAMES, 0, 1);
                expect(test.game.score()).to.equal(LOTSA_FRAMES);
                setTimeout(done, 50);
            });
        });
    });

    describe("#open (error handling)", () => {
        it("errors when 11+ pins", () => {
            let evilfunc = () => test.game.open(1, 11);
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/2 throws cannot exceed 10 pins/);
        });
        it("errors when 11+ pins (part 2)", () => {
            let evilfunc = () => test.game.open(2, 8);
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/2 throws cannot exceed 10 pins/);
        });
        it("errors when negative pins", () => {
            let evilfunc = () => test.game.open(-1, 3);
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/throw cannot be negative/);
        });
        it("errors when negative pins (part 2)", () => {
            let evilfunc = () => test.game.open(2, -2);
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(/throw cannot be negative/);
        });
    });

    describe("#spare", () => {
        it("when frame 1", () => {
            test.game.spare(4);
            test.game.open(8, 1);
            test.playOpenFrames(8, 0, 0);
            const expectedScore = sumReduce(10, 8, 8, 1);
            expect(test.game.score()).to.equal(expectedScore);
        });
        it("when frame 8", () => {
            test.playOpenFrames(7, 0, 0);
            test.game.spare(4);
            test.game.open(4, 5);
            test.game.open(0, 0);
            const expectedScore = sumReduce(10, 4, 4, 5);
            expect(test.game.score()).to.equal(expectedScore);
        });
        it("when frame 10", () => {
            test.playOpenFrames(8, 0, 0);
            test.game.open(4, 5);
            test.game.bowlTenthFrame(4, 6, 3);
            const expectedScore = sumReduce(9, 10, 3);
            expect(test.game.score()).to.equal(expectedScore);
        });
        it("player bowls many spares", () => {
            test.game.spare(7);
            test.game.spare(8);
            test.game.open(3, 4);
            test.playOpenFrames(7, 0, 0);
            const expectedScore = sumReduce(10, 8, 10, 3, 7);
            expect(test.game.score()).to.equal(expectedScore);
        });
        it("player bowls many spares with bonus", () => {
            test.playOpenFrames(8, 0, 0);
            test.game.spare(4);
            test.game.bowlTenthFrame(5, 5, 3);
            const expectedScore = sumReduce(10, 5, 10, 3);
            expect(test.game.score()).to.equal(expectedScore);
        });

        it("player bowls 10 zero-spare frames", () => {
            test.playMultipleFrames(9, game => {
                game.spare(0);
            });
            test.game.bowlTenthFrame(0, 10, 0);
            expect(test.game.score()).to.equal(100);
        });

        describe("Edge cases", () => {
            const gameScores = {
                part1: [NaN, 15, 30, 45, 55, 55],
                part2: [NaN, 15, 30, 45, 60, 75, 90, 105, 120, 130, 130],
            };

            for (let i = 1; i < gameScores.part1.length; i++) {
                const score = gameScores.part1[i];
                it(`part 1-${i}: when 4 spares and gutter balls`, () => {
                    test.game.spare(5);
                    test.game.spare(5);
                    test.game.spare(5);
                    test.game.spare(5);
                    test.game.open(0, 0);
                    expect(test.game.scoreNthFrame(i)).to.equal(score);
                });
            }

            for (let i = 1; i < gameScores.part2.length; i++) {
                const score = gameScores.part2[i];
                it(`part 2-${i}: when 9 spares and gutter balls`, () => {
                    test.playMultipleFrames(9, (game: BowlingGame) => {
                        game.spare(5);
                    });
                    test.game.open(0, 0);
                    expect(test.game.scoreNthFrame(i)).to.equal(score);
                });
            }
        });
    });

    describe("#spare (error handling)", () => {
        it("errors when 11+ pins", () => {
            let evilfunc = () => test.game.spare(14);
            expect(evilfunc).to.throw(/first throw of a spare cannot exceed 10/);
            expect(evilfunc).to.throw(BowlingGameError);
        });
        it("errors when 10 pins", () => {
            let evilfunc = () => test.game.spare(10);
            expect(evilfunc).to.throw(/first throw of a spare cannot exceed 10/);
            expect(evilfunc).to.throw(BowlingGameError);
        });
        it("errors when negative value", () => {
            let evilfunc = () => test.game.spare(-2);
            expect(evilfunc).to.throw(/throw cannot be negative/);
            expect(evilfunc).to.throw(BowlingGameError);
        });
    });

    describe("#strike", () => {
        it("player bowls a strike in frame 1", () => {
            test.game.strike();
            test.game.open(1, 6);
            test.playOpenFrames(8, 0, 0);
            const expectedScore = sumReduce(10, 1, 6, 1, 6);
            expect(test.game.score()).to.equal(expectedScore);
        });
        it("player bowls a strike in frame 4", () => {
            test.playOpenFrames(3, 0, 0);
            test.game.strike();
            test.game.open(4, 2);
            test.playOpenFrames(5, 0, 0);
            const expectedScore = sumReduce(10, 4, 2, 4, 2);
            expect(test.game.score()).to.equal(expectedScore);
        });
        it("player bowls a strike in frame 10", () => {
            test.playOpenFrames(9, 0, 0);
            test.game.bowlTenthFrame(10, 10, 10);
            expect(test.game.score()).to.equal(30);
        });
        it("player bowls perfect game", () => {
            test.playMultipleFrames(9, (g: BowlingGame) => g.strike());
            test.game.bowlTenthFrame(10, 10, 10);
            expect(test.game.score()).to.equal(300);
        });

        describe("Edge cases", () => {
            it("bowls alternating strikes & spares", () => {
                //Simulate a game where a player alternates between strike/spare
                test.playMultipleFrames(4, (game: BowlingGame) => {
                    game.strike();
                    game.spare(5);
                });
                test.game.strike();
                test.game.bowlTenthFrame(5, 5, 10);
                expect(test.game.score()).to.equal(200);
            });
            it("bowls alternating spares & strikes", () => {
                //Simulate a game where a player alternates between spares/strikes
                test.playMultipleFrames(4, (game: BowlingGame) => {
                    game.spare(8);
                    game.strike();
                });
                test.game.spare(5);
                test.game.bowlTenthFrame(10, 5, 5);
                expect(test.game.score()).to.equal(200);
            });
            it("player bowls 1 strike and 1 spare, no bonus", () => {
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
            it("player bowls many strikes and spares, no bonus", () => {
                test.playOpenFrames(3, 2, 0);
                test.game.strike();
                test.game.strike();
                test.game.spare(4);
                test.game.spare(7);
                test.game.open(1, 1);
                test.game.open(5, 0);
                test.game.bowlTenthFrame(5, 0);
                //Show all the math for 100% confidence in the total
                let first = 3 * 2;
                let strike1 = sumReduce(10, 10, 4);
                let strike2 = sumReduce(10, 4, 6);
                let spare1 = sumReduce(4, 6, 7);
                let spare2 = sumReduce(7, 3, 1);
                let mid = sumReduce(strike1, strike2, spare1, spare2, 1, 1);
                let last = 2 * 5;
                let expectedScore = sumReduce(first, mid, last);
                //Also tested with online bowling calculator: www.bowlinggenius.com
                debugs.fip00(`expectedScore===${expectedScore}`);
                expect(test.game.score()).to.equal(expectedScore);
            });
            it("player bowls many strikes and spares, yes bonus", () => {
                test.playOpenFrames(6, 2, 0);
                test.game.strike();
                test.game.spare(4);
                test.game.spare(7);
                test.game.bowlTenthFrame(10, 9, 1);
                //Show all the math for 100% confidence in the total
                let first = 6 * 2;
                let strike1 = sumReduce(10, 4, 6);
                let spare1 = sumReduce(4, 6, 7);
                let spare2 = sumReduce(7, 3, 10);
                let strike2 = sumReduce(10, 9, 1);
                let expectedScore = sumReduce(first, strike1, spare1, spare2, strike2);
                debugs.fip00(`expectedScore===${expectedScore}`);
                expect(test.game.score()).to.equal(expectedScore);
            });
            it("player bowls alternating frames of strike/spare/open", () => {
                test.playMultipleFrames(3, (game: BowlingGame) => {
                    game.strike();
                    game.spare(9);
                    game.open(4, 4);
                });
                test.game.bowlTenthFrame(4, 5);
                //Show all the math for 100% confidence in the total
                let expectedScore = sumReduce(10, 9, 1);
                expectedScore += sumReduce(9, 1, 4);
                expectedScore += sumReduce(4, 4);
                expectedScore *= 3;
                expectedScore += sumReduce(4, 5);
                expect(test.game.score()).to.equal(expectedScore);
            });
        });
    });

    describe("#scoreNthFrame", () => {
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

        describe("bowls frames in specific sequence strike/spare/open", () => {
            beforeEach(() => {
                // debugs.fip00(`...begin game`);
                test.game.strike();
                test.game.spare(9);
                test.game.open(4, 4);
                test.game.strike();
                test.game.spare(9);
                test.game.open(4, 4);
                test.game.strike();
                test.game.spare(9);
                test.game.open(4, 4);
                test.game.open(1, 1);
                debugs.fip00(`...END GAME`);
            });
            for (let i = 1; i <= 10; i++) {
                const score = CALCULATOR_SCORES.strikeSpareOpen[i];
                it(`verify calculator score at frame: ${i}`, () => {
                    expect(test.game.scoreNthFrame(i)).to.equal(score);
                });
            }
        });

        describe("bowls frames in specific sequence 2: spare/strike/open", () => {
            beforeEach(() => {
                test.game.spare(9);
                test.game.strike();
                test.game.open(4, 4);
                test.game.spare(9);
                test.game.strike();
                test.game.open(4, 4);
                test.game.spare(9);
                test.game.strike();
                test.game.open(4, 4);
                test.game.bowlTenthFrame(5, 5, 10);
            });
            for (let i = 1; i <= 10; i++) {
                const score = CALCULATOR_SCORES.spareStrikeOpen[i];
                it(`verify calculator score at frame: ${i}`, () => {
                    expect(test.game.scoreNthFrame(i)).to.equal(score);
                });
            }
        });

        describe("bowls frames in specific sequence 3: open/spare/strike", () => {
            beforeEach(() => {
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
            });
            for (let i = 1; i <= 10; i++) {
                const score = CALCULATOR_SCORES.openSpareStrike[i];
                it(`verify calculator score at frame: ${i}`, () => {
                    expect(test.game.scoreNthFrame(i)).to.equal(score);
                });
            }
        });

        describe("bowls frames in specific sequence 4: strike/open/spare", () => {
            beforeEach(() => {
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
            for (let i = 1; i <= 10; i++) {
                const score = CALCULATOR_SCORES.strikeOpenSpare[i];
                it(`verify calculator score at frame: ${i}`, () => {
                    expect(test.game.scoreNthFrame(i)).to.equal(score);
                });
            }
        });

        describe("bowls frames in specific sequence 5: strike/gutter", () => {
            beforeEach(() => {
                test.playMultipleFrames(4, (game: BowlingGame) => {
                    game.strike();
                    game.open(0, 0);
                });
                test.game.strike();
                test.game.bowlTenthFrame(0, 0);
            });
            for (let i = 1; i <= 10; i++) {
                const score = CALCULATOR_SCORES.strikeGutter[i];
                it(`verify calculator score at frame: ${i}`, () => {
                    expect(test.game.scoreNthFrame(i)).to.equal(score);
                });
            }
        });

        describe("bowls frames in specific sequence 6: spare/open/strike", () => {
            beforeEach(() => {
                test.playMultipleFrames(3, (game: BowlingGame) => {
                    game.spare(5);
                    game.open(4, 4);
                    game.strike();
                });
                test.game.bowlTenthFrame(5, 5, 4);
            });
            for (let i = 1; i <= 10; i++) {
                const score = CALCULATOR_SCORES.spareOpenStrike[i];
                it(`verify calculator score at frame: ${i}`, () => {
                    expect(test.game.scoreNthFrame(i)).to.equal(score);
                });
            }
        });

        describe("bowls frames in specific sequence 7: open/strike/spare", () => {
            beforeEach(() => {
                test.playMultipleFrames(3, (game: BowlingGame) => {
                    game.open(4, 4);
                    game.strike();
                    game.spare(5);
                });
                test.game.bowlTenthFrame(4, 4);
            });
            for (let i = 1; i <= 10; i++) {
                const score = CALCULATOR_SCORES.openStrikeSpare[i];
                it(`verify calculator score at frame: ${i}`, () => {
                    expect(test.game.scoreNthFrame(i)).to.equal(score);
                });
            }
        });
    });

    describe("#scoreNthFrame (error handling)", () => {
        /**
         * Helper function that constructs functions for testing errors
         */
        function setupFunc(test: TestSubject, nth: number) {
            return function () {
                test.game.open(1, 1);
                test.game.scoreNthFrame(nth);
            }
        }
        const badValues = [0, -2, 9, 11];
        badValues.forEach(function(nth, i) {
            it(`expect error; part ${i}`, () => {
                const badFunc = setupFunc(test, nth);
                debugs.fip01(`(nth,i)===(${nth},${i})`);
                expect(badFunc).to.throw(BowlingGameError);
                expect(badFunc).to.throw(/score is not defined for nthFrame/);
            });
        });
        it("clean; no errors", () => {
            let cleanfunc = setupFunc(test, 1);
            expect(cleanfunc).to.not.throw(/score is not defined for nthFrame/);
        });
    });

    describe("#bowlTenthFrame (error handling)", () => {
        function assertError(rxError: RegExp, ...throws: number[]) {
            const [ t1, t2, t3 ] = throws;
            let evilfunc = () => test.game.bowlTenthFrame(t1, t2, t3);
            expect(evilfunc).to.throw(BowlingGameError);
            expect(evilfunc).to.throw(rxError);
        }
        it("errors when negative pins", () => {
            assertError(/throw cannot be negative/, -1, 1);
        });
        it("errors when negative pins (part 2)", () => {
            assertError(/throw cannot be negative/, 2, -2);
        });
        it("errors when negative pins (part 3)", () => {
            assertError(/throw cannot be negative/, 3, 7, -3);
        });
        it("errors when 3rd throw is required", () => {
            assertError(/the 3rd throw cannot be undefined/, 5, 5);
        });
        it("errors when 3rd throw is required (part 2)", () => {
            assertError(/the 3rd throw cannot be undefined/, 9, 9);
        });
    });

});