import debug from 'debug';
import { Frame } from '../src/Frame';
const debugFip = debug("src:TenthFrame");

export class TenthFrame extends Frame {
    constructor(...throws: number[]) {
        super(...throws);
        //The 10th frame is scored in a special way (not based on bonusThrows)
        this.base = throws.slice(0, 3);
    }
}