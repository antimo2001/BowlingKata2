import debug from "debug";
const debugFip = debug("src:Frame");

/** This interface represents a frame in a bowling game. */
interface IFrame {
    getScore(): number;
    setBonusThrows(...bonusThrows: number[]): void;
    doneScoring(): boolean;
    getBaseThrows(): number[];
}

/** Represents a frame in a bowling game */
export abstract class Frame implements IFrame {

    constructor(...throws: number[]) {
        this.score = 0;
        this.hasBeenScored = false;
        this.bonusThrows = [];
        this.base = throws.slice(0, 2);
    }

    /**
     * Gets the score for this frame.
     * @overrides IFrame.getScore
     */
    getScore(): number {
        if (this.hasBeenScored) {
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
    setBonusThrows(...bonusThrows: number[]): void {
        this.bonusThrows = [];
    }

    /**
     * Returns true iff frame is done scoring
     * @overrides IFrame.doneScoring
     */
    doneScoring(): boolean {
        return this.hasBeenScored;
    }
    /**
     * Get the base throws
     * @overrides IFrame.getBaseThrows
     */
    getBaseThrows(): number[] {
        return this.base;
    }

    /** Raise errors if the throws for this frame are invalid. */
    public abstract validateThrows(): boolean;

    /** Returns true iff this frame has enough throws to be scored. */
    protected abstract canScore(): boolean;

    /** Sets the score for this frame. */
    protected abstract setScore(): Frame;

    /** Property represents the maximum pins for a frame */
    public static MAX_PINS: number = 10;

    /** Property represents the calculated score (includes the base and bonus) */
    protected score: number;

    /** Property represents that the score is already calculated */
    protected hasBeenScored: boolean;

    /** Property represents the bonus throws */
    protected bonusThrows: number[];

    /** Property represents the base throws */
    protected base: number[];
}
