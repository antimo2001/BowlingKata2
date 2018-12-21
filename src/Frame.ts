import debug from "debug";
const debugFip = debug("src:Frame");

/** Represents something with a score */
interface Scoreable {
    getScore(): number;
}

/** Represents a frame in a bowling game */
export class Frame implements Scoreable {
    protected bonusThrows: number[];
    protected base: number[];
    protected score: number;
    protected isScored: boolean;
    protected invokeCount: number;

    constructor(...throws: number[]) {
        this.bonusThrows = [];
        this.base = throws.slice(0, 2);
        this.score = 0;
        this.isScored = false;
        this.invokeCount = 0;
    }

    /**
     * Method to easily add array of numbers together
     * @param numbers this rest param contains the numbers to sum
     */
    public static sum(...numbers: number[]) {
        return numbers.reduce((p, c) => p + c, 0);
    }
    /**
     * Overload method to easily add array of numbers together
     * @param numbers array contains the numbers to sum
     */
    public static sumApply(numbers: number[]) {
        return numbers.reduce((p, c) => p + c, 0);
    }

    /** Returns true iff frame is done scoring */
    public doneScoring(): boolean {
        return this.isScored;
    }
    /** Get the base throws */
    public getBaseThrows(): number[] {
        return this.base;
    }
    /**
     * Concats the given array with the bonusThrows
     * @param bonusThrows this rest args contains the array of bonus throws
     */
    public setBonusThrows(...bonusThrows: number[]): Frame {
        // this.bonusThrows = bonusThrows.slice(0, 2);
        return this;
    }

    /** Gets the score */
    public getScore(): number {
        if (this.isScored) {
            debugFip(`getScore() was invoked ${++this.invokeCount} extra times`);
            return this.score;
        } else {
            return this.setScore().score;
        }
    }

    /**
     * Returns true iff this frame has enough throws to be scored
     */
    protected canScore(): boolean {
        return true;
    }
    /** Sets the score based on throws array */
    protected setScore(): Frame {
        if (!this.canScore()) {
            debugFip(`didnt set the score`);
            return this;
        }
        if (this.isScored) {
            debugFip(`already done scoring; keep score as is: ${this.score}`);
            return this;
        }
        const baseScore = this.base.slice(0, 2);
        this.score = Frame.sum(...baseScore);
        this.isScored = true;
        return this;
    }

}