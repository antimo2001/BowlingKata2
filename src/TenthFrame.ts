import debug from 'debug';
import { OpenFrame } from '../src/OpenFrame';
const debugFip = debug("src:TenthFrame");

export class TenthFrame extends OpenFrame {
    constructor(...throws: number[]) {
        super(...throws);
        //The 10th frame is scored in a special way (not based on bonusThrows)
        this.base = throws.slice(0, 3);
        debugFip(`constructed TenthFrame: base===[${this.base}]`);
    }
}