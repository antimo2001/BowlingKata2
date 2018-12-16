import debug from 'debug';
import { Frame } from './Frame';
import { StrikeFrame } from './StrikeFrame';
import { SpareFrame } from './SpareFrame';
import { OpenFrame } from './OpenFrame';
import { BonusFrame } from './BonusFrame';

// const debugSrc = debug("src:BowlingGame");
const debugFip = debug("fip01:src:BowlingGame");

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
        // this.updateScorePerFrame();
        this.updateScoreWhenOpenFrame();
    }

    /** Method for a player bowling a spare frame */
    public spare(firstThrow: number): void {
        let frame = new SpareFrame(this.throws.length);
        this.frames.push(frame);
        this.updateThrows(firstThrow, 10 - firstThrow);
        // this.updateScorePerFrame();
    }
    
    /** Method for a player bowling a strike */
    public strike(): void {
        let frame = new StrikeFrame(this.throws.length);
        this.frames.push(frame);
        this.updateThrows(10);
        // this.updateScorePerFrame();
    }
    
    /** Method for a player bowling the extra throws in the 10th frame */
    public bonusRoll(pins: number): void {
        this.frames.push(new BonusFrame(this.throws.length));
        this.updateThrows(pins);
        // this.updateScorePerFrame();
        this.updateScoreWhenOpenFrame();
    }

    /** Calculates score prior to the 10th frame */
    public scoreNthFrame(nthFrame: number): number {
        // debugFip(`frameScores.length===${this.frameScores.length}`);
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

    /** Update the scores only when the current frame is open or bonus */
    private updateScoreWhenOpenFrame() {
        debugFip('...');
        debugFip('...BEGIN updateScoreWhenOpenFrame');
        const sumReduce = (p: number, c: number) => p + c;
        const throws = this.throws;
        let baseScores: number[] = [];
        let extraScores: number[] = [];

        function getBaseScore(frame: Frame) {
            const frameIndex = frame.getFrameIndex();
            let base = 10;
            if (frame instanceof OpenFrame || frame instanceof BonusFrame) {
                let twothrows = [throws[frameIndex], throws[frameIndex + 1]];
                base = twothrows.reduce(sumReduce, 0);
            }

            return base;
        }

        function getExtraScore(frame: Frame) {
            const frameIndex = frame.getFrameIndex();

            /** Represents the extra scores added for strikes and spares */
            const extra = throws.filter((t, i) => {
                if (frame instanceof StrikeFrame) {
                    return (frameIndex + 2 === i || frameIndex + 1 === i);
                }
                if (frame instanceof SpareFrame) {
                    return (frameIndex + 2 === i);
                }
                if (frame instanceof OpenFrame || frame instanceof BonusFrame) {
                    return false;
                }
                throw `***DevError: unknown instance of Frame: ${frame.constructor.toString()}`
            });

            return extra.reduce(sumReduce, 0);
        }

        // Iterate thru all frames to recalculate the scores for each
        for (const frame of this.frames) {
            //Find the base scores per frame
            const base = getBaseScore(frame);
            //Find the extrascores per frame
            const extra = getExtraScore(frame);
            baseScores = [...baseScores, base];
            extraScores = [...extraScores, extra];
        }
        debugFip(`baseScores.length===${baseScores.length}; which should be 10? ${10===baseScores.length}`);
        debugFip(`baseScores===${baseScores}`);
        debugFip(`extraScores.length===${extraScores.length}; which should be 10? ${10===extraScores.length}`);
        debugFip(`extraScores===${extraScores}`);
        let totalSum: number = 0;
        const finalScores = baseScores.map((base, index) => {
            const extra = extraScores[index];
            totalSum += base + extra;
            debugFip(`prior,base,extra: ${totalSum},${base},${extra}`);
            return totalSum;
        });
        debugFip(`finalScores.length===${finalScores.length}; which should be 10? ${10===finalScores.length}`);
        debugFip(`finalScores===${finalScores}`);
        this.frameScores = finalScores;
    }
}
