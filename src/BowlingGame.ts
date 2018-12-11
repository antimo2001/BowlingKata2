import debug from 'debug';
import { Frame } from './Frame';
import { StrikeFrame } from './StrikeFrame';
import { SpareFrame } from './SpareFrame';
import { OpenFrame } from './OpenFrame';
import { BonusFrame } from './BonusFrame';

// const debugLog = debug("src:BowlingGame");
const debugTest = debug("test:src:BowlingGame");

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
        // debugTest(`before: this.throws.length==${this.throws.length}`);
        let frame = new SpareFrame(this.throws, firstThrow);
        this.frames.push(frame);
        this.setAllFrames(firstThrow, 10 - firstThrow);
        debugTest(`after: this.throws.length==${this.throws.length}`);
    }
    
    public strike(): void {
        let frame = new StrikeFrame(this.throws);
        this.frames.push(frame);
        this.setAllFrames(10);
    }

    public bonusRoll(pins: number): void {
        this.frames.push(new BonusFrame(this.throws));
        this.setAllFrames(pins);
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
        let total = 0;
        for(let f of this.frames) {
            total += f.score();
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
    private setAllFrames(throw1: number, throw2: number = 0): void {
        let newThrows = [...this.throws, throw1, throw2];
        for (let f of this.frames) {
            f.setThrows(newThrows);
        }
        this.throws = newThrows;
    }
}
