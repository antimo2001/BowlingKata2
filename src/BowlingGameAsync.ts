import debug from 'debug';
import { BowlingGame } from './BowlingGame';
import { Utility } from './Utility';

const debugFip = debug("src:BowlingGameAsync");

/**
 * Class represents a BowlingGame. Similar to the BowlingGame class but with
 * asynchronous methods.
 */
export class BowlingGameAsync {
    /**
     * Represents all frames for a bowling game
     */
    private game: BowlingGame;

    constructor() {
        this.game = new BowlingGame();
    }

    /**
     * This method is for representing a player rolling an open-frame. Throws
     * errors if the first or second throws are invalid.
     * @param firstThrow the first throw in the frame
     * @param secondThrow the second throw in the frame
     */
    public async open(firstThrow: number, secondThrow: number): Promise<void> {
        await this.game.open(firstThrow, secondThrow);
    }
    /**
     * Method for a player bowling a spare frame. Throws errors if first throw is
     * negative value or if the value exceeds 10 pins.
     * @param firstThrow the first throw in the frame
     */
    public async spare(firstThrow: number): Promise<void> {
        await this.game.spare(firstThrow);
    }
    /**
     * Method for a player bowling a strike
     */
    public async strike(): Promise<void> {
        await this.game.strike();
    }
    /**
     * Method for a player bowling the extra throws in the 10th frame. Throws
     * error if any inputs are negative numbers.
     * @param throw1 the first throw in the frame
     * @param throw2 the 2nd throw in the frame
     * @param throw3 the 3rd throw in the frame (optional)
     */
    public async bowlTenthFrame(throw1: number, throw2: number, throw3?: number): Promise<void> {
        await this.game.bowlTenthFrame(throw1, throw2, throw3);
    }
    /**
     * Gets the score for any frame of the game (ranges from 1 to 10). Throws
     * exception if game doesn't have an existing nthFrame.
     * @param nthFrame the frame number to fetch the score
     */
    public async scoreNthFrame(nthFrame: number): Promise<number> {
        await debugFip(`Simulate a slow network`);
        await Utility.stall(2);
        return await this.game.scoreNthFrame(nthFrame);
    }
    /**
     * Gets the total score for the game
     */
    public async score(): Promise<number> {
        return await this.game.score();
    }
}