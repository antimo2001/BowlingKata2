import debug from 'debug';
import { Frame } from './Frame';
import { StrikeFrame } from './StrikeFrame';
import { SpareFrame } from './SpareFrame';
import { OpenFrame } from './OpenFrame';
import { BonusFrame } from './BonusFrame';

const debugSrc = debug("src:BowlingGame");

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
        let frame = new OpenFrame(this.throws.length);
        this.frames.push(frame);
        this.updateThrows(firstThrow, secondThrow);
    }

    /** Method for a player bowling a spare frame */
    public spare(firstThrow: number): void {
        let frame = new SpareFrame(this.throws.length);
        this.frames.push(frame);
        this.updateThrows(firstThrow, 10 - firstThrow);
        // debugSrc(`after: this.throws.length==${this.throws.length}`);
    }
    
    /** Method for a player bowling a strike */
    public strike(): void {
        let frame = new StrikeFrame(this.throws.length);
        this.frames.push(frame);
        this.updateThrows(10);
    }
    
    /** Method for a player bowling the extra throws in the 10th frame */
    public bonusRoll(pins: number): void {
        this.frames.push(new BonusFrame(this.throws.length));
        this.updateThrows(pins);
        // debugSrc(`this.frames.length==${this.frames.length}`);
        // debugSrc(`this.throws==${this.throws}`);
        debugSrc(`this.score()==${this.score()}`);
    }

    /** Calculates the total score for the game */
    public score(simple: boolean = true): number {
        return simple? this.scoreForOf(): this.scoreMapReduce();
    }

    /** Calculates the total score for the game (simple for-of loop) */
    private scoreForOf(): number {
        let total = 0;
        for(let f of this.frames) {
            total += f.score(this.throws);
            // debugSrc(`frame[${i++}]; total==${total}`);
        }
        return total;
    }

    /** Calculates the total score for the game (with map-reduce algorithm) */
    private scoreMapReduce(): number {
        const scores = this.frames.map(f => f.score(this.throws));
        const total = scores.reduce((p, c) => p + c, 0);
        return total;
    }

    /** Update all of throws in this game with all of the new throws */
    private updateThrows(throw1: number, throw2?: number): void {
        let newThrows = [...this.throws, throw1];
        //Concat throw2 only if it is defined
        newThrows = (throw2===undefined ? newThrows: [...newThrows, throw2]);
        this.throws = newThrows;
    }
}
