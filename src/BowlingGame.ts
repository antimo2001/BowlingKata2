import debug from 'debug';
import { Frame } from './Frame';
import { StrikeFrame } from './StrikeFrame';
import { SpareFrame } from './SpareFrame';
import { OpenFrame } from './OpenFrame';
import { BonusFrame } from './BonusFrame';

// const debugLog = debug("test:src:BowlingGame");
const debugTest = debug("src:BowlingGame");

export class BowlingGame {
    frames: Frame[];
    throws: number[];

    constructor() {
        this.frames = [];
        this.throws = [];
    }

    /**
     * This method is for representing a player rolling an open-frame.
     * @param firstThrow the first throw in the frame
     * @param secondThrow the second throw in the frame
     */
    public open(firstThrow: number, secondThrow: number): void {
        let frame = new OpenFrame(this.throws, firstThrow, secondThrow);
        this.frames.push(frame);
        this.setAllFrames(firstThrow, secondThrow);
    }
    
    public spare(firstThrow: number): void {
        let frame = new SpareFrame(this.throws, firstThrow);
        this.frames.push(frame);
        this.setAllFrames(firstThrow, 10 - firstThrow);
        // debugTest(`after: this.throws.length==${this.throws.length}`);
    }
    
    public strike(): void {
        let frame = new StrikeFrame(this.throws);
        this.frames.push(frame);
        this.setAllFrames(10);
    }

    public bonusRoll(pins: number): void {
        this.frames.push(new BonusFrame(this.throws));
        this.setAllFrames(pins);
        // debugTest(`this.frames.length==${this.frames.length}`);
        // debugTest(`this.throws==${this.throws}`);
        debugTest(`this.score()==${this.score()}`);
    }

    /**
     * Calculates the total score for the game
     */
    public score(simple: boolean = true): number {
        return simple? this.scoreForOf(): this.scoreMapReduce();
    }

    /**
     * Calculates the total score for the game (simple for-of loop)
     */
    private scoreForOf(): number {
        let i = 0;
        let total = 0;
        for(let f of this.frames) {
            total += f.score();
            // debugTest(`frame[${i++}]; total==${total}`);
        }
        return total;
    }

    /**
     * Calculates the total score for the game (with map-reduce algorithm)
     */
    private scoreMapReduce(): number {
        const scores = this.frames.map(f => f.score());
        const total = scores.reduce((p, c) => p + c, 0);
        return total;
    }

    /** Update all of the frames in this game with all of the new throws */
    private setAllFrames(throw1: number, throw2?: number): void {
        let newThrows = [...this.throws, throw1];
        //Concat throw2 only if it is defined
        newThrows = (throw2===undefined ? newThrows: [...newThrows, throw2]);
        for (let f of this.frames) {
            f.setThrows(newThrows);
        }
        this.throws = newThrows;
    }
}
