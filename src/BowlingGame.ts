import debug from 'debug';
import { Frame } from './Frame';
import { StrikeFrame } from './StrikeFrame';
import { SpareFrame } from './SpareFrame';
import { OpenFrame } from './OpenFrame';
import { TenthFrame } from './TenthFrame';

const debugFip = debug("src:BowlingGame");

export class BowlingGame {
    /**
     * Represents all frames for a bowling game
     */
    frames: Frame[];
    /**
     * Represents the accumlated scores for each frame of the game.
     */
    scores: number[];
    private static MAX_PINS = 10;
    private static BOWLING_ERROR = "BowlingGameError";

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
            let msg = `${BowlingGame.BOWLING_ERROR}: 2 throws cannot exceed ${BowlingGame.MAX_PINS} pins`;
            debugFip(msg);
            throw RangeError(msg);
        }
        let frame = new OpenFrame(firstThrow, secondThrow);
        this.frames.push(frame);
        this.updateScoresPerFrame();
    }

    /** Method for a player bowling a spare frame */
    public spare(firstThrow: number): void {
        if (firstThrow >= BowlingGame.MAX_PINS) {
            let msg = `${BowlingGame.BOWLING_ERROR}: first throw of a spare cannot exceed ${BowlingGame.MAX_PINS} pins`;
            debugFip(msg);
            throw RangeError(msg);
        }
        let frame = new SpareFrame(firstThrow);
        this.frames.push(frame);
        this.updateScoresPerFrame();
    }
    
    /** Method for a player bowling a strike */
    public strike(): void {
        let frame = new StrikeFrame();
        this.frames.push(frame);
        this.updateScoresPerFrame();
    }
    
    /** Method for a player bowling the extra throws in the 10th frame */
    public bowlTenthFrame(throw1: number, throw2: number, throw3: number = 0): void {
        this.frames.push(new TenthFrame(throw1, throw2, throw3));
        this.updateScoresPerFrame();
    }

    /** Calculates score prior to the 10th frame */
    public scoreNthFrame(nthFrame: number): number {
        const scoreNth = this.scores[nthFrame - 1];
        if (!scoreNth) {
            let msg = `${BowlingGame.BOWLING_ERROR}: array index out of bounds; nthFrame===${nthFrame}`;
            debugFip(msg);
            throw RangeError(msg);
        }
        return scoreNth;
    }

    /** Gets the total score for the game */
    public score(): number {
        return this.scores[this.scores.length - 1];
    }

    /** Update the scores only when the frame can be scored */
    private updateScoresPerFrame() {
        if (this.cannotScoreYet()) {
            debugFip(`cannot score this game yet`);
            return;
        }
        //Create array of frames with their bonuses
        const nextFrames = this.frames.map((frame, i, frames) => {
            let next1 = frames[i+1];
            let bonus1 = !!next1? next1.getBaseThrows(): [];
            let bonus: number[] = [];

            if (frame instanceof StrikeFrame) {
                let next2 = frames[i+2];
                let bonus2 = !!next2? next2.getBaseThrows(): [];
                bonus = [...bonus1, ...bonus2].slice(0, 2);
            }
            else if (frame instanceof SpareFrame) {
                bonus = bonus1.slice(0, 1);
            }
            return { frame, bonus };
        });

        let totalSum: number = 0;
        const cumulatives = nextFrames.map(nf => {
            const {frame, bonus} = nf;
            const s = frame.setBonusThrows(...bonus).getScore();
            totalSum += s;
            return totalSum;
        });
        debugFip(`cumulatives===${cumulatives}`);
        this.scores = cumulatives;
    }

    private cannotScoreYet(): boolean {
        //Game cannot be scored if these:
        //only 1 frame and is a strike or spare
        //only 2 frames and both are strikes
        const f = this.frames;
        const violations = [
            f.length === 2 && f[0] instanceof StrikeFrame && f[1] instanceof StrikeFrame,
            f.length === 1 && f[0] instanceof StrikeFrame,
            f.length === 1 && f[0] instanceof SpareFrame,
        ];
        const cant = violations.filter(r => !!r);
        return cant.length > 0;
    }
}
