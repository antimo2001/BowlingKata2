import debug from 'debug';
import { Frame } from './Frame';
import { StrikeFrame } from './StrikeFrame';
import { SpareFrame } from './SpareFrame';
import { OpenFrame } from './OpenFrame';
import { BonusFrame } from './BonusFrame';

// const debugSrc = debug("src:BowlingGame");
const debugFip = debug("fip00:src:BowlingGame");

export class BowlingGame {
    /**
     * Represents all frames for a bowling game
     */
    frames: Frame[];
    /**
     * Represents all throws for a bowling game; frames usually have 2 throws,
     * with the obvious exception of strike-frames.
     */
    throws: number[];
    /**
     * Represents the score as per the prior frames of the game.
     */
    frameScores: number[];

    constructor() {
        this.frameScores = [];
        this.frames = [];
        this.throws = [];
    }

    /**
     * This method is for representing a player rolling an open-frame.
     * @param firstThrow the first throw in the frame
     * @param secondThrow the second throw in the frame
     */
    public open(firstThrow: number, secondThrow: number): void {
        let frame = new OpenFrame(this.throws.length);
        this.frames.push(frame);
        this.updateThrows(firstThrow, secondThrow);
        this.updateScorePerFrame();
    }

    /** Method for a player bowling a spare frame */
    public spare(firstThrow: number): void {
        let frame = new SpareFrame(this.throws.length);
        this.frames.push(frame);
        this.updateThrows(firstThrow, 10 - firstThrow);
        this.updateScorePerFrame();
    }
    
    /** Method for a player bowling a strike */
    public strike(): void {
        let frame = new StrikeFrame(this.throws.length);
        this.frames.push(frame);
        this.updateThrows(10);
        this.updateScorePerFrame();
    }
    
    /** Method for a player bowling the extra throws in the 10th frame */
    public bonusRoll(pins: number): void {
        this.frames.push(new BonusFrame(this.throws.length));
        this.updateThrows(pins);
        this.updateScorePerFrame();
    }

    /** Calculates score prior to the 10th frame */
    public scoreNthFrame(nthFrame: number): number {
        debugFip(`frameScores.length===${this.frameScores.length}`);
        const scoreNth = this.frameScores[nthFrame - 1];
        debugFip(`scoreNth===${scoreNth}`);
        if (!scoreNth) {
            let msg = `***RangeError: array index out of bounds; nthFrame===${nthFrame}`;
            debugFip(msg);
            throw RangeError(msg);
        }
        return scoreNth;
    }

    /** Calculates the total score for the game */
    public score(simple: boolean = true): number {
        return simple ? this.scoreForOf() : this.scoreMapReduce();
    }

    /** Calculates the total score for the game (simple for-of loop) */
    private scoreForOf(frames?: Frame[]): number {
        frames = frames!==undefined? frames: this.frames;
        let total = 0;
        for(let f of frames) {
            total += f.score(this.throws);
        }
        return total;
    }

    /** Calculates the total score for the game (with map-reduce algorithm) */
    private scoreMapReduce(frames?: Frame[]): number {
        frames = frames!==undefined? frames: this.frames;
        const scores = frames.map(f => f.score(this.throws));
        const total = scores.reduce((p, c) => p + c, 0);
        return total;
    }

    /** Concat more throws with all of the new throws */
    private updateThrows(throw1: number, throw2?: number): void {
        let newThrows = [...this.throws, throw1];
        //Concat throw2 only if it is defined
        newThrows = (throw2===undefined ? newThrows: [...newThrows, throw2]);
        this.throws = newThrows;
    }

    /** Update the running tally of scores for each frame */
    private updateScorePerFrame() {
        let scoreAtFrame = this.scoreMapReduce();
        this.frameScores = [...this.frameScores, scoreAtFrame];
    }
}
