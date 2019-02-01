import debug from 'debug';
import { Frame } from './Frame';
import { StrikeFrame } from './StrikeFrame';
import { SpareFrame } from './SpareFrame';
import { OpenFrame } from './OpenFrame';
import { TenthFrame } from './TenthFrame';
import { BowlingGameError } from './BowlingGameError';
import { Utility } from './Utility';

const debugFip = debug("src:BowlingGameAsync");

/** Class represents a BowlingGame */
export class BowlingGameAsync {
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
     * This method is for representing a player rolling an open-frame. Throws
     * errors if the first or second throws are invalid.
     * @param firstThrow the first throw in the frame
     * @param secondThrow the second throw in the frame
     */
    public async open(firstThrow: number, secondThrow: number): Promise<void> {
        let frame = new OpenFrame(firstThrow, secondThrow);
        frame.validateThrows(firstThrow, secondThrow);
        this.frames.push(frame);
        await this.updateScoresPerFrame();
    }
    /**
     * Method for a player bowling a spare frame. Throws errors if first throw is
     * negative value or if the value exceeds 10 pins.
     * @param firstThrow the first throw in the frame
     */
    public async spare(firstThrow: number): Promise<void> {
        let spare = new SpareFrame(firstThrow);
        spare.validateThrows(firstThrow);
        this.frames.push(spare);
        await this.updateScoresPerFrame();
    }
    /**
     * Method for a player bowling a strike
     */
    public async strike(): Promise<void> {
        let strike = new StrikeFrame();
        this.frames.push(strike);
        await this.updateScoresPerFrame();
    }
    /**
     * Method for a player bowling the extra throws in the 10th frame. Throws
     * error if any inputs are negative numbers.
     * @param throw1 the first throw in the frame
     * @param throw2 the 2nd throw in the frame
     * @param throw3 the 3rd throw in the frame (optional)
     */
    public async bowlTenthFrame(throw1: number, throw2: number, throw3?: number): Promise<void> {
        let throws = [throw1, throw2];
        //Concat throw3 if it is defined
        throws = throw3 !== undefined ? [...throws, throw3]: throws;
        let tenth = new TenthFrame(...throws);
        tenth.validateThrows(...throws);
        this.frames.push(tenth);
        await this.updateScoresPerFrame();
    }
    /**
     * Gets the score for any frame of the game (ranges from 1 to 10). Throws
     * exception if game doesn't have an existing nthFrame.
     * @param nthFrame the frame number to fetch the score
     */
    public async scoreNthFrame(nthFrame: number): Promise<number> {
        const scoreNth = this.scores[nthFrame - 1];
        if (scoreNth===undefined || scoreNth===null) {
            const msg = `score is not defined for nthFrame: ${nthFrame}`;
            debugFip(msg);
            throw new BowlingGameError(msg);
        }
        return scoreNth;
    }
    /**
     * Gets the total score for the game
     */
    public async score(): Promise<number> {
        return this.scores[this.scores.length - 1];
    }

    /**
     * Update the accumlated scores for this game
     */
    private async updateScoresPerFrame(): Promise<void> {
        //Simulate a slow network
        await Utility.stall(5);
        if (this.cannotScoreYet()) {
            debugFip(`cannot score this game yet`);
            return;
        }
        try {
            await this.setBonusThrowsPerFrame();
        } catch(err) {
            debugFip(`***setBonusThrowsPerFrame() failed with error: ${err}`);
            throw err;
        }
        try {
            this.scores = await this.addCumulativeScores();
        } catch(err) {
            debugFip(`***addCumulativeScores() failed with error: ${err}`);
            throw err;
        }
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
        this.frames.filter(f => !f.doneScoring()).map((...params) => {
            const [ frame, i, frames ] = params;
            const bonus1 = getBaseThrowsOrEmpty(frames[i + 1]);
            let bonus: number[] = [];
            if (frame instanceof StrikeFrame) {
                const bonus2 = getBaseThrowsOrEmpty(frames[i + 2]);
                bonus = [...bonus1, ...bonus2];
            }
            else if (frame instanceof SpareFrame) {
                bonus = bonus1;
            }
            return { frame, bonus };
        }).forEach(fb => {
            const { frame, bonus } = fb;
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
