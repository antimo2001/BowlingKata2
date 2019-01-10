import debug from 'debug';
import { Frame } from './Frame';
import { StrikeFrame } from './StrikeFrame';
import { SpareFrame } from './SpareFrame';
import { OpenFrame } from './OpenFrame';
import { TenthFrame } from './TenthFrame';

const debugFip = debug("src:BowlingGame");

/** Class represents a BowlingGame exception */
export class BowlingGameError extends Error {
    constructor(message: string) {
        super(message);
        //Practicing subclasses of Typescript's Error class see the following
        //potential issue; https://stackoverflow.com/questions/41102060/typescript-extending-error-class

        // Set the prototype explicitly.
        // Object.setPrototypeOf(this, BowlingGameError.prototype);
    }
}

/** Class represents a BowlingGame exception */
export class BowlingGame {
    /**
     * Represents all frames for a bowling game
     */
    public frames: Frame[];
    /**
     * Represents the accumlated scores for each frame of the game
     */
    private scores: number[];
    /**
     * Represents the maximum number of pins in one frame
     */
    private static MAX_PINS = 10;

    constructor() {
        this.scores = [];
        this.frames = [];
    }

    /**
     * This method is for representing a player rolling an open-frame.
     * @param firstThrow the first throw in the frame
     * @param secondThrow the second throw in the frame
     */
    public open(firstThrow: number, secondThrow: number): void {
        if (firstThrow + secondThrow > BowlingGame.MAX_PINS) {
            this.failWithError(`2 throws cannot exceed ${BowlingGame.MAX_PINS} pins`);
        }
        if (firstThrow < 0) {
            this.failWithError(`throw cannot be negative: ${firstThrow}`);
        }
        if (secondThrow < 0) {
            this.failWithError(`throw cannot be negative: ${secondThrow}`);
        }
        let frame = new OpenFrame(firstThrow, secondThrow);
        this.frames.push(frame);
        this.updateScoresPerFrame();
    }
    /**
     * Method for a player bowling a spare frame
     * @param firstThrow the first throw in the frame
     */
    public spare(firstThrow: number): void {
        if (firstThrow < 0) {
            this.failWithError(`throw cannot be negative: ${firstThrow}`);
        }
        if (firstThrow >= BowlingGame.MAX_PINS) {
            this.failWithError(`first throw of a spare cannot exceed ${BowlingGame.MAX_PINS} pins`);
        }
        let frame = new SpareFrame(firstThrow);
        this.frames.push(frame);
        this.updateScoresPerFrame();
    }
    /**
     * Method for a player bowling a strike
     */
    public strike(): void {
        let frame = new StrikeFrame();
        this.frames.push(frame);
        this.updateScoresPerFrame();
    }
    /**
     * Method for a player bowling the extra throws in the 10th frame
     * @param throw1 the first throw in the frame
     * @param throw2 the 2nd throw in the frame
     * @param throw3 the 3rd throw in the frame (optional)
     */
    public bowlTenthFrame(throw1: number, throw2: number, throw3?: number): void {
        let throws = [throw1, throw2];
        //Concat throw3 if it is defined
        throws = throw3!==undefined? [...throws, throw3]: throws;
        if (throws.some(t => t < 0)) {
            this.failWithError(`throw cannot be negative`);
        }
        this.frames.push(new TenthFrame(...throws));
        this.updateScoresPerFrame();
    }
    /**
     * Gets the score for any frame of the game (ranges from 1 to 10). Throws
     * exception if game doesn't have an existing nthFrame.
     * @param nthFrame the frame number to fetch the score
     */
    public scoreNthFrame(nthFrame: number): number {
        const scoreNth = this.scores[nthFrame - 1];
        if (scoreNth===undefined || scoreNth===null) {
            this.failWithError(`array index out of bounds; nthFrame===${nthFrame}`);
        }
        return scoreNth;
    }
    /**
     * Gets the total score for the game
     */
    public score(): number {
        return this.scores[this.scores.length - 1];
    }

    /**
     * Throw BowlingGame error with the given message
     * @param message the error message
     */
    private failWithError(message: string) {
        debugFip(message);
        throw new BowlingGameError(message);
    }
    /**
     * Update the accumlated scores for this game
     */
    private updateScoresPerFrame(): void {
        if (this.cannotScoreYet()) {
            debugFip(`cannot score this game yet`);
            return;
        }

        //Set the bonus for each frame
        this.setBonusThrowsPerFrame();

        //Calculate the cumulative scores
        this.scores = this.addCumulativeScores();
    }
    /**
     * Returns true if this game cannot be scored yet.
     * Game cannot be scored if these:
     * (1) the 1st frame is a strike or spare
     * (2) only 2 frames and both are strikes
     */
    private cannotScoreYet(): boolean {
        const f = this.frames;
        const fc = this.frames.length;
        const violations = [
            fc === 2 && f[0] instanceof StrikeFrame && f[1] instanceof StrikeFrame,
            fc === 1 && f[0] instanceof StrikeFrame,
            fc === 1 && f[0] instanceof SpareFrame,
        ];
        return violations.some(v => !!v);
    }
    /**
     * Set the bonusThrows for each frame
     */
    private setBonusThrowsPerFrame(): void {
        const getBaseThrowsOrEmpty = (frame: Frame): number[] => {
            return !!frame ? frame.getBaseThrows() : [];
        }
        //Set the bonus for each frame (especially unscored frames)
        const unscored = this.frames.filter(f => !f.doneScoring());
        unscored.forEach((frame, i, frames) => {
            let bonus1 = getBaseThrowsOrEmpty(frames[i + 1]);
            let bonus: number[] = [];
            if (frame instanceof StrikeFrame) {
                let bonus2 = getBaseThrowsOrEmpty(frames[i + 2]);
                bonus = [...bonus1, ...bonus2];
            }
            else if (frame instanceof SpareFrame) {
                bonus = bonus1;
            }
            frame.setBonusThrows(...bonus);
        });
    }
    /**
     * Calculate the accumulated scores per frame
     */
    private addCumulativeScores(): number[] {
        let total: number = 0;
        const cumulatives = this.frames.map(frame => {
            total += frame.getScore();
            return total;
        });
        debugFip(`cumulatives===${cumulatives}`);
        return cumulatives;
    }

}
