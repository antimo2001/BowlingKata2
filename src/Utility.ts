import debug from 'debug';

const debugFip = debug("fip01:src:Utility");

/**
 * Utility functions
 */
export class Utility {
    /**
     * Return array of numbers given the range of integers.
     * @param start 1st number in range
     * @param stop last numger
     * @param step interval; defaults to 1
     */
    public static range(start: number, stop: number, step: number = 1): number[] {
        const max = Math.ceil((stop - start) / step);
        debugFip(`max: ${max}`);
        const r = Array(max).fill(start).map((x, y) => x + y * step);
        debugFip(`range is: ${r}`);
        return r;
    }
}
