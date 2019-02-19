/**
 * practice generators (which is a special iterator the evaluates lazily)
 */
class Utility2 {

    /**
     * Return iterator of integers given the start and end integers.
     * @param start first number in range
     * @param end last number (note it is excluded from the result!)
     * @param step interval; defaults to 1
     */
    static * range(start: number, end: number, step: number = 1): Iterable<number> {
        for (let i = start; i < end; i += step) {
            yield i
        }
    }
}

class Practices {
    /**
     * Simple parameter values
     */
    static p1(): void {
        const start = 0
        const end = 9
        const rrange = Utility2.range(start, end)
        //Use a for-of loop to consume the range()
        for (const i of rrange) {
            console.log(`range(${start}, ${end})===${i}`)
        }
    }
    /**
     * Complex parameter values
     */
    static p2(): void {
        const start = 10
        const end = 41
        const step = 10
        const rrange = Utility2.range(start, end, step)
        for (const i of rrange) {
            console.log(`range(${start}, ${end}, ${step})===${i}`)
        }
    }
    static p3(): void {
        const start = 1000
        const end = Number.MAX_SAFE_INTEGER
        const step = 150400300200114
        const rrange = Utility2.range(start, end, step)
        for (const i of rrange) {
            console.log(`range(${start}, ${end}, ${step})===${i}`)
        }
    }
}

/**
 * ----------------------------------- MAIN -----------------------------------
 */
{
    Practices.p3();
    Practices.p2();
    Practices.p1();
}
