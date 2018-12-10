import { expect } from 'chai';
import 'mocha';
import { BowlingGame } from '../src/BowlingGame';
import { StrikeFrame } from '../src/StrikeFrame';
import { SpareFrame } from '../src/SpareFrame';
import { OpenFrame } from '../src/OpenFrame';

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
}

describe("BowlingGame", () => {
    let test: TestSubject;
    
    beforeEach(() => {
        test = new TestSubject();
    });

    it("#openFrame", () => {
        test.game.open(1, 2);
        expect(test.game.score()).to.be.equal(3);
    });

    it("player throws all gutterballs", () => {
        test.playOpenFrames(10, 0, 0);
        expect(test.game.score()).to.be.equal(0);
    });

});