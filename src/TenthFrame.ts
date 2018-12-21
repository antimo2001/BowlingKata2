import debug from 'debug';
import { Frame } from '../src/Frame';
const debugFip = debug("src:TenthFrame");

export class TenthFrame extends Frame {
    constructor(...throws: number[]) {
        super(...throws);
        this.bonusThrows = [];
        //The 10th frame is scored in a special way (not based on bonusThrows)
        this.base = throws.slice(0, 3);
        this.score = 0;
        this.isScored = false;
    }

    /**
     * Returns true iff this 10th frame has enough throws to be scored
     * @override Frame.canScore
     */
    protected canScore(): boolean {
        return this.base.length > 1;
    }

    /**
     * Set the score for this Spare
     * @override Frame.setScore
     */
    protected setScore(): Frame {
        if (!this.canScore()) {
            debugFip(`didnt set the score: bonusThrows.length===${this.bonusThrows.length}`);
            return this;
        }
        this.score = Frame.sum(...this.base);
        this.isScored = true;
        return this;
    }
}