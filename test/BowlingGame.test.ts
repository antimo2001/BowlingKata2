import 'mocha';
import debug from 'debug';
import { expect } from 'chai';
import { BowlingGame } from '../src/BowlingGame';
import { StrikeFrame } from '../src/StrikeFrame';
import { SpareFrame } from '../src/SpareFrame';
import { OpenFrame } from '../src/OpenFrame';
import { Frame } from '../src/Frame';

/** Helper function for debugging */
const debugLog = debug("test:BowlingGame");

/** Helper functions for debugging other fixes in-progress */
const debugs = {
    fip00: debug("fip00:test:BowlingGame"),
    fip01: debug("fip01:test:BowlingGame"),
    fip02: debug("fip02:test:BowlingGame"),
    //FYI: FIP stands for fix in-progress
};

/** Helper function for calculating the sum */
const sumReduce = (...scores: number[]) => {
    return Frame.sum(...scores);
}

class TestSubject {
    public game: BowlingGame;
    constructor() {
        this.game = new BowlingGame();
    }
    /** Helper function is used to execute multiple open-frames for a game */
    playOpenFrames(frameTotalCount: number, firstThrow: number, secondThrow: number): void {
        for (let i = 0; i < frameTotalCount; i++) {
            this.game.open(firstThrow, secondThrow);
        }
    }
    /** Helper function is for invoking multiple frames (of any type) for a game */
    playMultipleFrames(loopCount: number, iterator: Function): void {
        let cb = (iterator===undefined? () => {} : iterator);
        for (let i = 0; i < loopCount; i++) {
            cb.call(this, this.game);
        }
    }
}

describe("BowlingGame", () => {
    let test: TestSubject;

    beforeEach(() => {
        test = new TestSubject();
    });

    describe("#openFrame", () => {
        it("single frame", () => {
            test.game.open(1, 2);
            expect(test.game.score()).to.be.equal(3);
        });

        it("multiple frames", () => {
            test.game.open(1, 2);
            test.game.open(3, 4);
            const expectedScore = sumReduce(1, 2, 3, 4);
            expect(test.game.score()).to.be.equal(expectedScore);
        });

        it("up to 5 frames", () => {
            test.game.open(1, 2);
            test.game.open(3, 4);
            test.game.open(1, 1);
            test.game.open(2, 2);
            test.game.open(3, 3);
            let expectedScore = sumReduce(3, 7, 2, 4, 6);
            expect(test.game.score()).to.be.equal(expectedScore);
        });
        it("player throws all gutterballs", () => {
            test.playOpenFrames(10, 0, 0);
            expect(test.game.score()).to.be.equal(0);
        });
        it("player bowls 3 pins per throw", () => {
            test.playOpenFrames(10, 3, 3);
            expect(test.game.score()).to.be.equal(60);
        });
    });

    describe("#spare", () => {
        it("player bowls a spare in frame 1", () => {
            test.game.spare(4);
            test.game.open(8, 1);
            test.playOpenFrames(8, 0, 0);
            const expectedScore = sumReduce(10, 8, 8, 1);
            expect(test.game.score()).to.be.equal(expectedScore);
        });
        it("player bowls a spare in frame 8", () => {
            test.playOpenFrames(7, 0, 0);
            test.game.spare(4);
            test.game.open(4, 5);
            test.game.open(0, 0);
            const expectedScore = sumReduce(10, 4, 4, 5);
            expect(test.game.score()).to.be.equal(expectedScore);
        });
        it("player bowls a spare in frame 10", () => {
            test.playOpenFrames(8, 0, 0);
            test.game.open(4, 5);
            test.game.bowlTenthFrame(4, 6, 3);
            const expectedScore = sumReduce(9, 10, 3);
            expect(test.game.score()).to.be.equal(expectedScore);
        });
        it("player bowls many spares", () => {
            test.game.spare(7);
            test.game.spare(8);
            test.game.open(3, 4);
            test.playOpenFrames(7, 0, 0);
            const expectedScore = sumReduce(10, 8, 10, 3, 7);
            expect(test.game.score()).to.be.equal(expectedScore);
        });
        it("player bowls many spares with bonus", () => {
            test.playOpenFrames(8, 0, 0);
            test.game.spare(4);
            // test.game.spare(5);
            test.game.bowlTenthFrame(5, 5, 3);
            const expectedScore = sumReduce(10, 5, 10, 3);
            expect(test.game.score()).to.be.equal(expectedScore);
        });
    });

    describe("#strike", () => {
        it("player bowls a strike in frame 1", () => {
            test.game.strike();
            test.game.open(1, 6);
            test.playOpenFrames(8, 0, 0);
            const expectedScore = sumReduce(10, 1, 6, 1, 6);
            expect(test.game.score()).to.be.equal(expectedScore);
        });
        it("player bowls a strike in frame 4", () => {
            test.playOpenFrames(3, 0, 0);
            // debugLog(`before test.game.throws===${test.game.throws}`);
            test.game.strike();
            test.game.open(4, 2);
            test.playOpenFrames(5, 0, 0);
            // debugLog(`after test.game.throws===${test.game.throws}`);
            const expectedScore = sumReduce(10, 4, 2, 4, 2);
            expect(test.game.score()).to.be.equal(expectedScore);
        });
        it("player bowls a strike in frame 10", () => {
            test.playOpenFrames(9, 0, 0);
            test.game.bowlTenthFrame(10, 10, 10);
            expect(test.game.score()).to.be.equal(30);
        });
        it("player bowls perfect game", () => {
            test.playMultipleFrames(9, (g: BowlingGame) => g.strike());
            test.game.bowlTenthFrame(10, 10, 10);
            expect(test.game.score()).to.be.equal(300);
        });
    });

    describe("#mixture of frames", () => {
        it("player bowls alternating strikes & spares", () => {
            //Simulate a game where a player alternates between strike/spare
            test.playMultipleFrames(4, (game: BowlingGame) => {
                game.strike();
                game.spare(5);
            });
            test.game.strike();
            test.game.bowlTenthFrame(5, 5, 10);
            expect(test.game.score()).to.equal(200);
        });
        it("player bowls alternating spares & strikes", () => {
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
                debugLog(`expectedScore===${expectedScore}`);
                debugLog(`is expectedScore===90? ${90 === expectedScore? "yes": "OH NO"}`);
            }
            expect(test.game.score()).to.equal(expectedScore);
        });
        it("player bowls many strikes and spares, yes bonus", () => {
            test.playOpenFrames(6, 2, 0);
            test.game.strike();
            test.game.spare(4);
            test.game.spare(7);
            // test.game.strike();
            test.game.bowlTenthFrame(10, 9, 1);
            let expectedScore: number;
            {
                //Show all the math for 100% confidence in the total
                let first = 6 * 2;
                let strike1 = sumReduce(10, 4, 6);
                let spare1 = sumReduce(4, 6, 7);
                let spare2 = sumReduce(7, 3, 10);
                let strike2 = sumReduce(10, 9, 1);
                // let mid = sumReduce(strike1, spare1, spare2);
                expectedScore = sumReduce(first, strike1, spare1, spare2, strike2);
                debugLog(`expectedScore===${expectedScore}`);
                debugLog(`is expectedScore===89? ${89 === expectedScore ? "yes" : "OH NO"}`);
            }
            expect(test.game.score()).to.equal(expectedScore);
        });
        it("player bowls alternating frames of strike/spare/open", () => {
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

    describe("#scoreNthFrame", () => {
        describe("when it fails", () => {
            /** Helper function that constructs functions for testing errors */
            let createFn: Function;
            beforeEach(() => {
                createFn = (test: TestSubject, nth: number) => {
                    return function() {
                        test.game.open(1, 1);
                        test.game.scoreNthFrame(nth);
                    }
                }
            });

            it("expect error; part 0", () => {
                let testFn = createFn(test, 0);
                expect(testFn).to.throws(/array index out of bounds/);
                expect(testFn).to.throws(/BowlingGameError/);
            });
            it("expect error; part 1", () => {
                let testFn = createFn(test, 9);
                expect(testFn).to.throws(/array index out of bounds/);
                expect(testFn).to.throws(/BowlingGameError/);
            });
            it("expect error; part 2", () => {
                let testFn = createFn(test, -22);
                expect(testFn).to.throws(/array index out of bounds/);
                expect(testFn).to.throws(/BowlingGameError/);
            });
            it("clean; no errors", () => {
                let cleanfunc = createFn(test, 1);
                expect(cleanfunc).to.not.throws(/array index out of bounds/);
                expect(cleanfunc).to.not.throws(/BowlingGameError/);
            });
        });

        describe("bowls frames in specific sequence strike/spare/open", () => {
            /**
             * Define a constant array representing scores for a specifc game.
             * The bowling game will be in this sequence of frames:
             * strike, spare, open-frame, strike, spare, open-frame, open-frame.
             * Note: this is Nth based array (instead of based on N-1); that's why
             * the 0th value is NaN!
             */
            const calculatorScores = [NaN, 20, 34, 42, 62, 76, 84, 104, 118, 126, 128];
            
            beforeEach(() => {
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

            it("regression test end-game score", () => {
                expect(test.game.scoreNthFrame(10)).to.equal(calculatorScores[10]);
                expect(test.game.scoreNthFrame(10)).to.equal(test.game.score());
            });

            calculatorScores.map((score, i) => {
                it(`verify calculator (${score}) at frame: ${i}`, () => {
                    if (i > 0) {
                        expect(test.game.scoreNthFrame(i)).to.equal(score);
                    }
                });
            });
        });

        describe("bowls frames in specific sequence 2: spare/strike/open", () => {
            /**
             * Define a constant array representing scores for a specifc game.
             * Note: this is Nth based array (instead of based on N-1); that's why
             * the 0th value is NaN!
             */
            const calculatorScores = [NaN, 20, 38, 46, 66, 84, 92, 112, 130, 138, 158];

            beforeEach(() => {
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

            it("regression test end-game score", () => {
                expect(test.game.scoreNthFrame(10)).to.equal(calculatorScores[10]);
                expect(test.game.scoreNthFrame(10)).to.equal(test.game.score());
            });

            calculatorScores.map((score, i) => {
                it(`verify calculator score at frame: ${i}`, () => {
                    if (i > 0) {
                        expect(test.game.scoreNthFrame(i)).to.equal(score);
                    }
                });
            });
        });

        describe("bowls frames in specific sequence 3: open/spare/strike", () => {
            /**
             * This is Nth based (instead of N-1); that's why NaN is the 0th value
             */
            const calculatorScores = [NaN, 8, 28, 46, 54, 74, 92, 100, 120, 150, 180];

            beforeEach(() => {
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

            it("regression test end-game score", () => {
                expect(test.game.scoreNthFrame(10)).to.equal(calculatorScores[10]);
                expect(test.game.scoreNthFrame(10)).to.equal(test.game.score());
            });

            calculatorScores.map((score, i) => {
                it(`verify calculator score at frame: ${i}`, () => {
                    if (i > 0) {
                        expect(test.game.scoreNthFrame(i)).to.equal(score);
                    }
                });
            });
        });
    });

    describe("Edge Tests", () => {
        describe("when game is only open frames", () => {
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
            it("fails with error when 11+ pins", () => {
                let evilfunc = () => {
                    test.game.open(1, 11);
                    test.game.open(2, 22);
                }
                expect(evilfunc).to.throw(/2 throws cannot exceed 10 pins/);
                expect(evilfunc).to.throw(/BowlingGameError/);
            });
            it("fails with error when 99 frames", () => {
                const LOTSA_FRAMES = 99;
                test.playOpenFrames(LOTSA_FRAMES, 0, 1);
                expect(test.game.frames.length).to.equal(LOTSA_FRAMES);
                expect(test.game.score()).to.equal(LOTSA_FRAMES);
            })
        });

        describe("only spare frames", () => {
            const calculatorGames = {
                part1: [NaN, 15, 30, 45, 55, 55],
                part2: [NaN, 15, 30, 45, 60, 75, 90, 105, 120, 130, 130],
            };

            calculatorGames.part1.forEach((score, i) => {
                if (i <= 0) {
                    return;
                }
                it(`part 1-${i}: when 4 spares and gutter balls`, () => {
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
                it(`part 2-${i}: when 9 spares and gutter balls`, () => {
                    test.playMultipleFrames(9, (game: BowlingGame) => {
                        game.spare(5);
                    });
                    test.game.open(0, 0);
                    expect(test.game.scoreNthFrame(i)).to.equal(score);
                });
            });

            it("spares with throws of 11+ pins", () => {
                let evilfunc = () => {
                    test.game.spare(11);
                }
                expect(evilfunc).to.throw(/first throw of a spare cannot exceed 10 pins/);
                expect(evilfunc).to.throw(/BowlingGameError/);
            });
        });
    });

});