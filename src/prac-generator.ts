//practice generators (which is a special iterator the evaluates lazily)

class Utility2 {

    /**
     * Return iterator of integers given the start and end integers.
     * @param start first number in range
     * @param end last number (note it is excluded from the result!)
     * @param step interval; defaults to 1
     */
    public static * range(start: number, end: number, step: number = 1): IterableIterator<number> {
        let state = start
        while (state < end) {
            yield state
            state += step
        }
    }

}

/**
 * ----------------------------------- MAIN -----------------------------------
 */
{
    // const PRACTICE_TOGGLE: string = 'practice1'
    const start = 10
    const stop = 21
    // const stop = Number.MAX_SAFE_INTEGER
    const rrange = Utility2.range(start, stop, 10)

    //must use a for-of loop to consume the range()
    for (const i of rrange) {
        console.log(`${i}`)
    }
}

