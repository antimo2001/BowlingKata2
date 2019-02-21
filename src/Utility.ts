import debug from 'debug';
const debugFip = debug("src:Utility");

/**
 * Utility functions
 */
export class Utility {

    /**
     * Method to easily add array of numbers together
     * @param numbers this rest param contains the numbers to sum
     */
    static sum(...numbers: number[]) {
        return numbers.reduce((p, c) => p + c, 0);
    }

    /**
     * Overload method to easily add array of numbers together
     * @param numbers array contains the numbers to sum
     */
    static sumApply(numbers: number[]) {
        return Utility.sum(...numbers);
    }

    /**
     * Delay some async operation (useful for simulating slow async functions)
     * @param delay amount of time in milliseconds to delay; defaults to 3000
     */
    static async stall(delay: number = 3000): Promise<void> {
        return await new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Return array of numbers given the range of integers.
     * @param start first number in range
     * @param stop last number (note it is excluded from the result!)
     * @param step interval; defaults to 1
     */
    static range(start: number, stop: number, step: number = 1): number[] {
        const max = Math.ceil((stop - start) / step);
        debugFip(`max: ${max}`);
        const r = Array(max).fill(start).map((x, y) => x + y * step);
        debugFip(`range is: ${r}`);
        return r;
    }

    /**
     * Return an Iterable of numbers given the range of integers. This overload
     * is useful if the range needs to be lazily evaluated.
     * @param start first number in range
     * @param stop last number (note it is excluded from the result!)
     * @param step interval; defaults to 1
     */
    static * rangez(start: number, stop: number, step: number = 1): Iterable<number> {
        const ascend = start < stop;
        let i = start;
        while ((ascend && i < stop) || (!ascend && i > stop)) {
            debugFip(`yielding this: ${i}`);
            yield i;
            i += step;
        }
    }
}
