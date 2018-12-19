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
     * Represents all throws for a bowling game; frames usually have 2 throws,
     * with the obvious exception of strike-frames.
     */
    throws: number[];
    /**
     * Represents the score as per the prior frames of the game.
     */
    frameScores: number[];
    private static MAX_PINS = 10;
    private static BOWLING_ERROR = "BowlingGameError";

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
        if (firstThrow + secondThrow > BowlingGame.MAX_PINS) {
            let msg = `${BowlingGame.BOWLING_ERROR}: 2 throws cannot exceed ${BowlingGame.MAX_PINS} pins`;
            debugFip(msg);
            throw RangeError(msg);
        }
        let frame = new OpenFrame(firstThrow, secondThrow);
        this.frames.push(frame);
        this.updateThrows(firstThrow, secondThrow);
        this.updateScoresPerFrame();
    }

    /** Method for a player bowling a spare frame */
    public spare(firstThrow: number): void {
        if (firstThrow >= BowlingGame.MAX_PINS) {
            let msg = `${BowlingGame.BOWLING_ERROR}: first throw of a spare cannot exceed ${BowlingGame.MAX_PINS} pins`;
            debugFip(msg);
            throw RangeError(msg);
        }
        let frame = new SpareFrame(this.throws.length);
        this.frames.push(frame);
        this.updateThrows(firstThrow, BowlingGame.MAX_PINS - firstThrow);
    }
    
    /** Method for a player bowling a strike */
    public strike(): void {
        let frame = new StrikeFrame(this.throws.length);
        this.frames.push(frame);
        this.updateThrows(BowlingGame.MAX_PINS);
    }
    
    /** Method for a player bowling the extra throws in the 10th frame */
    public bonusRoll(pins: number): void {
        this.frames.push(new TenthFrame(this.throws.length));
        this.updateThrows(pins);
        this.updateScoresPerFrame();
    }

    /** Calculates score prior to the 10th frame */
    public scoreNthFrame(nthFrame: number): number {
        const scoreNth = this.frameScores[nthFrame - 1];
        debugFip(`scoreNth===${scoreNth}`);
        if (!scoreNth) {
            let msg = `${BowlingGame.BOWLING_ERROR}: array index out of bounds; nthFrame===${nthFrame}`;
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
            total += f.getScore();
        }
        return total;
    }

    /** Calculates the total score for the game (with map-reduce algorithm) */
    private scoreMapReduce(frames?: Frame[]): number {
        frames = frames!==undefined? frames: this.frames;
        const scores = frames.map(f => f.getScore());
        return Frame.sum(...scores);
    }

    /** Concat more throws with all of the new throws */
    private updateThrows(throw1: number, throw2?: number): void {
        let newThrows = [...this.throws, throw1];
        //Concat throw2 only if it is defined
        newThrows = (throw2===undefined ? newThrows: [...newThrows, throw2]);
        this.throws = newThrows;
    }

    /** Update the scores only when the current frame is open or bonus */
    private updateScoresPerFrame() {
        // Use 2 parallel arrays to represent the base scores and extra scores
        let baseScores: number[] = [];
        let extraScores: number[] = [];
        // Iterate thru all frames to recalculate the scores for each
        for (const frame of this.frames) {
            //Find the base scores per frame and the extrascores per frame
            const base = this.getBaseScore(frame);
            const extra = this.getExtraScore(frame);
            //Concat the base scores and extras
            baseScores = [...baseScores, base];
            extraScores = [...extraScores, extra];
        }
        // debugFip(`baseScores===${baseScores}`);
        // debugFip(`extraScores===${extraScores}`);
        debugFip(`baseScores has same length as frames? ${baseScores.length===this.frames.length}`);
        debugFip(`extraScores has same length as frames? ${extraScores.length===this.frames.length}`);
        let totalSum: number = 0;
        const finalScores = baseScores.map((base, index) => {
            const extra = extraScores[index];
            totalSum += base + extra;
            // debugFip(`totalSum,base,extra: ${totalSum},${base},${extra}`);
            return totalSum;
        });
        // debugFip(`finalScores.length===${finalScores.length}; which should be 10? ${10===finalScores.length}`);
        // debugFip(`finalScores===${finalScores}`);
        this.frameScores = finalScores;
    }

    /**
     * This is for getting the base score per frame. Strikes and spares have
     * a base score of 10. Other frames have less.
     */
    private getBaseScore(frame: Frame): number {
        const fi = frame.getFrameIndex();
        if (frame instanceof OpenFrame || frame instanceof TenthFrame) {
            let twothrows = [this.throws[fi], this.throws[fi + 1]];
            return this.sumnums(twothrows);
        }
        if (frame instanceof StrikeFrame || frame instanceof SpareFrame) {
            return BowlingGame.MAX_PINS;
        }
        throw `***DevError: unknown instance of Frame: ${frame.constructor.toString()}`;
    }

    /**
     * This is for getting the extra scores per frame.  Strikes get 2 extra
     * throws added to its score; spares get 1 extra. Other frames get none.
     */
    private getExtraScore(frame: Frame): number {
        const fi = frame.getFrameIndex();
        //Filter the throws for only strikes and spares
        const extra = this.throws.filter((t, i) => {
            if (frame instanceof StrikeFrame) {
                return (fi + 2 === i || fi + 1 === i);
            }
            if (frame instanceof SpareFrame) {
                return (fi + 2 === i);
            }
            if (frame instanceof OpenFrame || frame instanceof TenthFrame) {
                return false;
            }
            debugFip(`(t,i,fi)==(${t},${i},${fi})`);
            const msg = `***DevError: unknown instance of Frame: ${frame.constructor.toString()}`;
            debugFip(msg);
            throw msg;
        });
        debugFip(`assert that extra.length is 2 or fewer? ${extra.length <= 2}`);
        return this.sumnums(extra);
    }

}
