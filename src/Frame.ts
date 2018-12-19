import debug from "debug";
const debugFip = debug("fip01:src:Frame");

/** Represents something with a score */
interface Scoreable {
    getScore(): number;
}

/** Represents a frame in a bowling game */
export class Frame implements Scoreable {
    // protected throwIndex: number;
    // protected throws: number[];
    // protected maxBonusThrows: number;
    // protected minBonusThrows: number;
    protected bonusThrows: number[];
    protected base: number[];
    protected score: number;
    protected isScored: boolean;

    constructor(...throws: number[]) {
        this.bonusThrows = [];
        this.base = throws.slice(0, 2);
        this.score = 0;
        this.isScored = false;
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

    /**
     * Concats the given array with the bonusThrows
     * @param bonusThrows this rest args contains the array of all throws
     */
    public setBonusThrows(...bonusThrows: number[]): Frame {
        this.bonusThrows = bonusThrows.slice(0, 2); //NTS: this really applies to spares and strikes
        // this.bonusThrows = [];
        return this;
    }

    /**
     * Returns true iff this frame has enough throws to be scored
     */
    public canScore(): boolean {
        return true;
    }

    /** Gets the score */
    public getScore(): number {
        if (this.isScored) {
            return this.score;
        } else {
            return this.setScore().score;
        }
    }
    /** Sets the score based on throws array */
    protected setScore(): Frame {
        if (!this.canScore()) {
            debugFip(`didnt set the score`);
            return this;
        }
        const baseScore = this.base.slice(0, 2);
        this.score = Frame.sum(...baseScore);
        this.isScored = true;
        return this;
    }

}