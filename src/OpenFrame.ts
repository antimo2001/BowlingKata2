import debug from 'debug';
import { Utility } from '../src/Utility';
import { Frame } from '../src/Frame';
const debugFip = debug('src:OpenFrame');

export class OpenFrame extends Frame {

    constructor(...throws: number[]) {
        super(...throws);
        this.base = throws.slice(0, 2);
    }

    /**
     * Returns true iff this Open frame has enough base throws to be scored
     * @overrides Frame.canScore
     */
    protected canScore(): boolean {
        return this.base.length > 1;
    }

    /**
     * Set the score for this Spare
     * @overrides Frame.setScore
     */
    protected setScore(): Frame {
        if (!this.canScore()) {
            return this;
        }
        if (this.hasBeenScored) {
            debugFip(`already done scoring; keep score as is: ${this.score}`);
            return this;
        }
        this.score = Utility.sumApply(this.base);
        this.hasBeenScored = true;
        return this;
    }
}