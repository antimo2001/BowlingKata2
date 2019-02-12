import debug from "debug";
import { IFrame } from "./IFrame";
import { BowlingGameError } from "./BowlingGameError";
const debugFip = debug("src:Frame");

/**
 * Represents a frame in a bowling game
 */
export abstract class Frame implements IFrame {

    constructor(...throws: number[]) {
        this._score = 0;
        this._hasBeenScored = false;
        this._bonusThrows = [];
        this._base = throws.slice(0, 2);
    }

    /**
     * Sets the bonusThrows.
     * @param bonusThrows this rest args contains the array of bonus throws
     */
    abstract setBonusThrows(...bonusThrows: number[]): void;

    /**
     * Gets the score for this frame. This also sets the score if the frame has
     * not yet been scored, then returns the score.
     * @overrides IFrame.getScore
     */
    get score(): number {
        if (!this.hasBeenScored) {
            this.setScore();
            return this._score;
        } else {
            return this._score;
        }
    }

    /**
     * Gets the hasBeenScored property
     * @overrides IFrame.hasBeenScored
     */
    get hasBeenScored(): boolean {
        return this._hasBeenScored;
    }

    /**
     * Gets the base throws property
     * @overrides IFrame.getBaseThrows
     */
    get baseThrows(): number[] {
        return this._base;
    }

    /**
     * Raise errors if the throws for this frame are invalid. Returns true if no
     * errors occurred.
     * @overrides IFrame.validateThrows
     */
    validateThrows(): boolean {
        if (this._base.some(t => isNaN(t))) {
            const msg = `throw cannot be NaN`;
            debugFip(msg);
            throw new BowlingGameError(msg);
        }
        return true;
    }

    /**
     * Sets the score for this frame.
     */
    protected abstract setScore(): void;

    //#region Property Definitions

    /**
     * Property represents the maximum pins for a frame
     */
    public static readonly MAX_PINS: number = 10;

    /**
     * Property represents the calculated score (includes the base and bonus)
     */
    protected _score: number;

    /**
     * Property represents that the score is already calculated
     */
    protected _hasBeenScored: boolean;

    /**
     * Property represents the bonus throws
     */
    protected _bonusThrows: number[];

    /**
     * Property represents the base throws
     */
    protected _base: number[];

    //#endregion Property Definitions
}
