import { Frame } from './Frame';
import { StrikeFrame } from './StrikeFrame';
import { SpareFrame } from './SpareFrame';
import { OpenFrame } from './OpenFrame';
import { BonusFrame } from './BonusFrame';

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
    }

    public spare(firstThrow: number): void {
        let frame = new SpareFrame(this.throws, firstThrow);
        this.frames.push(frame);
    }

    public strike(): void {
        let frame = new StrikeFrame(this.throws);
        this.frames.push(frame);
    }

    public bonusRoll(pins: number): void {
        this.frames.push(new BonusFrame(this.throws));
    }

    /**
     * Calculates the total score for the game
     */
    public score(): number {
        let total = 0;
        for(let f of this.frames) {
            total += f.score();
        }
        return total;
    }
}