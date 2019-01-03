import debug from 'debug';
import { Frame } from '../src/Frame';
const debugFip = debug("src:OpenFrame");

export class OpenFrame extends Frame {
    constructor(...throws: number[]) {
        super(...throws);
    }
}