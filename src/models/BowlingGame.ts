import debug from 'debug';
import { Utility } from '../Utility';
import { BowlingGameError } from './BowlingGameError';

const debugFip = debug("src:BowlingGame");

/**
 * Define enum to represent a bowling game's frame.
 */
const enum FrameType {
    OPEN = 0,
    SPARE,
    STRIKE,
    TENTH,
}

/**
 * Class represents a BowlingGame
 */
export class BowlingGame {
    /**
     * Represents all frames for a bowling game (use array of hashmaps)
     */
    private frames: Map<string, any>[];

    /**
     * Represents the accumlated scores for each frame of the game
     */
    private scores: number[];

    constructor() {
        this.scores = [];
        this.frames = [];
    }

    /**
     * This method is for representing a player rolling an open-frame. Throws
     * errors if the first or second throws are invalid.
     * @param firstThrow the first throw in the frame
     * @param secondThrow the second throw in the frame
     */
    public open(firstThrow: number, secondThrow: number): void {
        const base = [firstThrow, secondThrow];
        const frame = this.constructFrame(FrameType.OPEN, base);
        this.frames.push(frame);
    }
    /**
     * Method for a player bowling a spare frame. Throws errors if first throw is
     * negative value or if the value exceeds 10 pins.
     * @param firstThrow the first throw in the frame
     */
    public spare(firstThrow: number): void {
        const base = [firstThrow, 10 - firstThrow];
        const frame = this.constructFrame(FrameType.SPARE, base);
        this.frames.push(frame);
    }
    /**
     * Method for a player bowling a strike
     */
    public strike(): void {
        const frame = this.constructFrame(FrameType.STRIKE, [10]);
        this.frames.push(frame);
    }
    /**
     * Method for a player bowling the extra throws in the 10th frame. Throws
     * error if any inputs are negative numbers.
     * @param throw1 the first throw in the frame
     * @param throw2 the 2nd throw in the frame
     * @param throw3 the 3rd throw in the frame (optional)
     */
    public bowlTenthFrame(throw1: number, throw2: number, throw3?: number): void {
        //Concat the first 2 throws
        const first = [throw1, throw2];
        //Concat throw3 only if it is defined
        const all = throw3!==undefined ? [...first, throw3] : first;
        const frame = this.constructFrame(FrameType.TENTH, all);
        this.frames.push(frame);
    }
    /**
     * Gets the score for any frame of the game (ranges from 1 to 10). Throws
     * exception if game doesn't have an existing nthFrame.
     * @param nthFrame the frame number to fetch the score
     */
    public scoreNthFrame(nthFrame: number): number {
        this.updateScoresPerFrame();
        const scoreNth = this.scores[nthFrame - 1];
        if (scoreNth === undefined || scoreNth === null) {
            const msg = `score is not defined for nthFrame: ${nthFrame}`;
            debugFip(msg);
            throw new BowlingGameError(msg);
        }
        return scoreNth;
    }
    /**
     * Gets the total score for the game
     */
    public score(): number {
        this.updateScoresPerFrame();
        return this.scores[this.scores.length - 1];
    }

    // #region Private Methods

    /**
     * Initializes a frame; also verifies if the frame is valid
     * @param type FrameType
     * @param base the base throws to initialize the frame
     */
    private constructFrame(type: FrameType, base: number[]): Map<string, any> {
        let frame = new Map<string, any>();
        frame.set('type', type);
        frame.set('canScore', false);
        frame.set('hasBeenScored', false);
        frame.set('base', base);
        frame.set('score', NaN);
        if (!this.validateFrame(frame)) {
            debugFip(`***frame is invalid`);
        }
        return frame;
    }
    /**
     * Raise errors if the frame is invalid. Returns true if it is ok.
     * @param frame the hashmap to validate against certain rules
     */
    private validateFrame(frame: Map<string, any>): boolean {
        const type: FrameType = frame.get('type');
        const base: number[] = frame.get('base');
        const MAX_PINS = 10;
        const raiseError = (msg: string) => {
            debugFip(msg);
            throw new BowlingGameError(msg);
        }
        if (base.some(n => isNaN(n))) {
            raiseError(`throw cannot be NaN`);
        }
        if (type === FrameType.SPARE) {
            if (base[0] >= MAX_PINS) {
                raiseError(`first throw of a spare cannot exceed ${MAX_PINS} pins`);
            }
        }
        if (type === FrameType.OPEN) {
            const [firstThrow, secondThrow] = base;
            if (firstThrow + secondThrow >= MAX_PINS) {
                raiseError(`2 throws cannot exceed ${MAX_PINS} pins`);
            }
        }
        if (type === FrameType.TENTH) {
            const [t1, t2, t3] = base;
            if (t1 + t2 >= MAX_PINS && t3 === undefined) {
                raiseError(`the 3rd throw cannot be undefined`);
            }
            if (t1 + t2 < MAX_PINS && t3 !== undefined) {
                raiseError(`the 3rd throw is not allowed since first throws are too low`);
            }
        }
        if (base.some(t => t < 0)) {
            raiseError(`throw cannot be negative`);
        }

        //No errors, so return true
        return true;
    }
    /**
     * Update the accumlated scores for this game
     */
    private updateScoresPerFrame(): void {
        if (this.cannotScoreYet()) {
            debugFip(`cannot score this game yet`);
            return;
        }

        try {
            this.setFrameBonusAndScore();
        } catch (err) {
            debugFip(`***setBonusThrowsPerFrame() failed with error: ${err}`);
            throw err;
        }
        try {
            //Calculate the cumulative scores
            this.scores = this.addCumulativeScores();
        } catch (err) {
            debugFip(`***addCumulativeScores() failed with error: ${err}`);
            throw err;
        }
    }
    /**
     * Returns true if this game cannot be scored yet.
     * Game cannot be scored if these:
     * (1) if the 1st frame is a strike or spare
     * (2) if the game has 2 frames so far and both are strikes
     */
    private cannotScoreYet(): boolean {
        const f = this.frames;
        const fc = this.frames.length;
        const t0: FrameType = !!f[0] ? f[0].get('type') : null;
        const t1: FrameType = !!f[1] ? f[1].get('type') : null;
        const violations = [
            fc === 2 && t0 === FrameType.STRIKE && t1 === FrameType.STRIKE,
            fc === 1 && t0 === FrameType.STRIKE,
            fc === 1 && t0 === FrameType.SPARE,
        ];
        return violations.some(v => !!v);
    }

    /**
     * Get the base throws from the given frame; returns [] if undefined
     * @param frame the hashmap to get the base from
     */
    private getBase(frame: Map<string, any>): number[] {
        return (!!frame ? frame.get('base') : []);
    }
    /**
     * Verify the frame-type is a valid value; also sets the score to 0 and the
     * hasBeenScored property to false
     * @param frame the hashmap to verify the frame-type
     */
    private isTypeValid(frame: Map<string, any>): boolean {
        const type: FrameType = frame.get('type');
        const isValid = [FrameType.OPEN, 1, 2, 3].some(t => t === type);
        if (!isValid) {
            debugFip(`***unexpected FrameType: ${type}`);
            frame.set('score', 0);
            frame.set('hasBeenScored', false);
            return false;
        }
        else {
            return true;
        }
    }
    /**
     * Set the bonus and the score for each frame
     */
    private setFrameBonusAndScore(): void {
        //Set the bonus for each frame (especially unscored frames)
        const unscored = this.frames.filter(f => !f.get('hasBeenScored'));
        unscored.forEach((frame, i, frames) => {
            const type: FrameType = frame.get('type');
            const base: number[] = frame.get('base');
            if (!this.isTypeValid(frame)) {
                //Continue the foreach loop
                return;
            }
            let score = Utility.sum(...base);
            if (type === FrameType.SPARE || type === FrameType.STRIKE) {
                //Calculate the bonus of this strike or spare using the FrameType
                let b1 = this.getBase(frames[i + 1]);
                let b2 = type === FrameType.STRIKE ? this.getBase(frames[i + 2]) : [];
                let bonus = [...b1, ...b2].slice(0, type);
                score = Utility.sum(...base, ...bonus);
            }
            frame.set('score', score);
            frame.set('hasBeenScored', true);
        });
    }
    /**
     * Calculate the accumulated scores per frame
     */
    private addCumulativeScores(): number[] {
        const allFramesAreScored = this.frames.length === this.scores.length;
        if (this.frames.length > 0 && allFramesAreScored) {
            debugFip(`found no new frames in this game, so return all scores`);
            return this.scores;
        }
        let total: number = 0;
        const cumulatives = this.frames.map(frame => {
            if (frame.get('hasBeenScored')) {
                const score: number = frame.get('score');
                total += score;
            }
            return total;
        });
        debugFip(`cumulatives===${cumulatives}`);
        return cumulatives;
    }

    // #endregion Private Methods

}