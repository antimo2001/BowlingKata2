import 'mocha';
import debug from 'debug';
import { expect } from 'chai';
import { BowlingGame } from '../src/BowlingGame';
import { StrikeFrame } from '../src/StrikeFrame';
import { SpareFrame } from '../src/SpareFrame';
import { OpenFrame } from '../src/OpenFrame';

/** Helper function for debugging */
const debugLog = debug("test:BowlingGame");

/** Helper function for calculating the sum */
const sumReduce = (...scores: number[]) => {
    return scores.reduce((p, n) => p + n);
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
    /** Helper method for testing 2nd algorithm of the BowlingGame.score() method */
    getScore2nd(): number {
        return this.game.score(false);
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
            expect(test.getScore2nd()).to.be.equal(3);
        });

        it("multiple frames", () => {
            test.game.open(1, 2);
            test.game.open(3, 4);
            const expectedScore = sumReduce(1, 2, 3, 4);
            expect(test.game.score()).to.be.equal(expectedScore);
            expect(test.getScore2nd()).to.be.equal(expectedScore);
        });

        it("up to 5 frames", () => {
            test.game.open(1, 2);
            test.game.open(3, 4);
            test.game.open(1, 1);
            test.game.open(2, 2);
            test.game.open(3, 3);
            let expectedScore = sumReduce(3, 7, 2, 4, 6);
            expect(test.game.score()).to.be.equal(expectedScore);
            expect(test.getScore2nd()).to.be.equal(expectedScore);
        });
        it("player throws all gutterballs", () => {
            test.playOpenFrames(10, 0, 0);
            expect(test.game.score()).to.be.equal(0);
            expect(test.getScore2nd()).to.be.equal(0);
        });
        it("player bowls 3 pins per throw", () => {
            test.playOpenFrames(10, 3, 3);
            expect(test.game.score()).to.be.equal(60);
            expect(test.getScore2nd()).to.be.equal(60);
        });
    });

    describe("#spare", () => {
        it("player bowls a spare in frame 1", () => {
            test.game.spare(4);
            test.game.open(8, 1);
            test.playOpenFrames(8, 0, 0);
            const expectedScore = sumReduce(10, 8, 8, 1);
            expect(test.game.score()).to.be.equal(expectedScore);
            expect(test.getScore2nd()).to.be.equal(expectedScore);
        });
        it("player bowls a spare in frame 8", () => {
            test.playOpenFrames(7, 0, 0);
            test.game.spare(4);
            test.game.open(4, 5);
            test.game.open(0, 0);
            const expectedScore = sumReduce(10, 4, 4, 5);
            expect(test.game.score()).to.be.equal(expectedScore);
            expect(test.getScore2nd()).to.be.equal(expectedScore);
        });
        it("player bowls a spare in frame 10", () => {
            test.playOpenFrames(8, 0, 0);
            test.game.open(4, 5);
            test.game.spare(4);
            test.game.bonusRoll(3);
            const expectedScore = sumReduce(9, 10, 3);
            // debugLog(`after: test.game.throws==${test.game.throws.length};`);
            expect(test.game.score()).to.be.equal(expectedScore);
            expect(test.getScore2nd()).to.be.equal(expectedScore);
        });
        it("player bowls many spares", () => {
            test.game.spare(7);
            test.game.spare(8);
            test.game.open(3, 4);
            test.playOpenFrames(7, 0, 0);
            const expectedScore = sumReduce(10, 8, 10, 3, 7);
            expect(test.game.score()).to.be.equal(expectedScore);
            expect(test.getScore2nd()).to.be.equal(expectedScore);
        });
        it("player bowls many spares with bonus", () => {
            test.playOpenFrames(8, 0, 0);
            test.game.spare(4);
            test.game.spare(5);
            test.game.bonusRoll(3);
            const expectedScore = sumReduce(10, 5, 10, 3);
            expect(test.game.score()).to.be.equal(expectedScore);
            expect(test.getScore2nd()).to.be.equal(expectedScore);
        });
    });

    describe("#strike", () => {
        it("player bowls a strike in frame 1", () => {
            test.game.strike();
            test.game.open(1, 6);
            test.playOpenFrames(8, 0, 0);
            const expectedScore = sumReduce(10, 1, 6, 1, 6);
            expect(test.game.score()).to.be.equal(expectedScore);
            expect(test.getScore2nd()).to.be.equal(expectedScore);
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
            expect(test.getScore2nd()).to.be.equal(expectedScore);
        });
        it("player bowls a strike in frame 10", () => {
            test.playOpenFrames(9, 0, 0);
            test.game.strike();
            test.game.bonusRoll(10);
            test.game.bonusRoll(10);
            expect(test.game.score()).to.be.equal(30);
            expect(test.getScore2nd()).to.be.equal(30);
        });
        it("player bowls perfect game", () => {
            test.playMultipleFrames(10, (g: BowlingGame) => g.strike());
            test.game.bonusRoll(10);
            test.game.bonusRoll(10);
            expect(test.game.score()).to.be.equal(300);
            expect(test.getScore2nd()).to.be.equal(300);
        });
    });

    describe("#mixture of frames", () => {
        it("player bowls alternating strikes & spares", () => {
            //Simulate a game where a player alternates between strike/spare
            test.playMultipleFrames(5, (game: BowlingGame) => {
                game.strike();
                game.spare(5);
            });
            test.game.bonusRoll(10);
            expect(test.game.score()).to.equal(200);
            expect(test.getScore2nd()).to.equal(200);
        });
        it("player bowls alternating spares & strikes", () => {
            //Simulate a game where a player alternates between spares/strikes
            test.playMultipleFrames(5, (game: BowlingGame) => {
                game.spare(8);
                game.strike();
            });
            test.game.bonusRoll(5);
            test.game.bonusRoll(5);
            expect(test.game.score()).to.equal(200);
            expect(test.getScore2nd()).to.equal(200);
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
            expect(test.getScore2nd()).to.equal(expectedScore);
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
            expect(test.getScore2nd()).to.equal(expectedScore);
        });
        it("player bowls many strikes and spares, yes bonus", () => {
            test.playOpenFrames(6, 2, 0);
            test.game.strike();
            test.game.spare(4);
            test.game.spare(7);
            test.game.strike();
            test.game.bonusRoll(9);
            test.game.bonusRoll(1);
            let expectedScore: number;
            {
                //Show all the math for 100% confidence in the total
                let first = 6 * 2;
                let strike1 = sumReduce(10, 4, 6);
                let spare1 = sumReduce(4, 6, 7);
                let spare2 = sumReduce(7, 3, 10);
                let strike2 = sumReduce(10, 9, 1);
                let mid = sumReduce(strike1, spare1, spare2);
                expectedScore = sumReduce(first, mid, strike2);
                debugLog(`expectedScore===${expectedScore}`);
                debugLog(`is expectedScore===89? ${89 === expectedScore ? "yes" : "OH NO"}`);
            }
            expect(test.game.score()).to.equal(expectedScore);
            expect(test.getScore2nd()).to.equal(expectedScore);
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
            expect(test.getScore2nd()).to.equal(expectedScore);
        });
    });

});