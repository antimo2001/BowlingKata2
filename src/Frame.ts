import debug from "debug";
import { IFrame } from "./IFrame";
import { BowlingGameError } from "./BowlingGameError";
const debugFip = debug("src:Frame");

/**
 * Represents a frame in a bowling game
 */
export abstract class Frame implements IFrame {

    constructor(...throws: number[]) {
        this.score = 0;
        this.hasBeenScored = false;
        this.bonusThrows = [];
        this.base = throws.slice(0, 2);
    }

    /**
     * Gets the score for this frame. This also sets the score if the frame has
     * not yet been scored, then returns the score.
     * @overrides IFrame.getScore
     */
    public getScore(): number {
        if (this.doneScoring()) {
            return this.score;
        } else {
            return this.setScore().score;
        }
    }

    /**
     * Sets the bonusThrows.
     * @param bonusThrows this rest args contains the array of bonus throws
     * @overrides IFrame.setBonusThrows
     */
    public setBonusThrows(...bonusThrows: number[]): void {
        const unscored = !this.doneScoring();
        if (unscored) {
            this.bonusThrows = [];
        } else {
            debugFip(`system cannot reset the bonus after frame has been scored`);
        }
    }

    /**
     * Returns true iff frame is done scoring
     * @overrides IFrame.doneScoring
     */
    public doneScoring(): boolean {
        return this.hasBeenScored;
    }

    /**
     * Get the base throws
     * @overrides IFrame.getBaseThrows
     */
    public getBaseThrows(): number[] {
        return this.base;
    }

    /**
     * Raise errors if the throws for this frame are invalid. Returns true if no
     * errors occurred.
     */
    public validateThrows(): boolean {
        if (this.base.some(t => isNaN(t))) {
            const msg = `throw cannot be NaN`;
            debugFip(msg);
            throw new BowlingGameError(msg);
        }
        return true;
    }

    /**
     * Returns true iff this frame has enough throws to be scored.
     */
    protected abstract canScore(): boolean;

    /**
     * Sets the score for this frame.
     */
    protected abstract setScore(): Frame;

    //#region Property Definitions

    /**
     * Property represents the maximum pins for a frame
     */
    public static MAX_PINS: number = 10;

    /**
     * Property represents the calculated score (includes the base and bonus)
     */
    protected score: number;

    /**
     * Property represents that the score is already calculated
     */
    protected hasBeenScored: boolean;

    /**
     * Property represents the bonus throws
     */
    protected bonusThrows: number[];

    /**
     * Property represents the base throws
     */
    protected base: number[];

    //#endregion Property Definitions
}
