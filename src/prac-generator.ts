import debug from 'debug'
const debugFip = debug("offsrc:prac-generator")

/**
 * practice generators/iterators
 */
export default class Practice3 {
    /**
     * Return iterator of integers given the start and end integers.
     * @param start first number in range
     * @param stop last number (note it is excluded from the result!)
     * @param step interval; defaults to 1
     */
    static * rangez(start: number, stop: number, step: number = 1): Iterable<number> {
        debugFip(`BEGIN: [start, end, step]===[${start}, ${stop}, ${step}]`)
        const ascend = start < stop
        let i = start
        while ((ascend && i < stop) || (!ascend && i > stop)) {
            debugFip(`yielding this: ${i}`)
            yield i
            i += step
        }
        debugFip(`END rangez`)
    }

    /**
     * Transforms the given Iterable and returns array
     * @param iterateme Iterable of numbers to iterate
     */
    static transform(iterateme: Iterable<any>): any[] {
        // let values: any[] = []
        // for (const z of iterateme) {
        //     values.push(z)
        // }
        return Array.from(iterateme)

        /*
        Learning Lesson: use Array.from() to transform any ArrayLike things into
        actual arrays!
        */
    }

    /**
     * Simple parameter values
     */
    static p1(): void {
        const start = 0
        const stop = 9
        const rrange = Practice3.rangez(start, stop)
        //Use a for-of loop to consume the range()
        for (const i of rrange) {
            console.log(`rangez(${start}, ${stop})===${i}`)
        }
    }
    /**
     * Complex parameter values
     */
    static p2(): void {
        const start = 10
        const stop = 41
        const step = 10
        const rrange = Practice3.rangez(start, stop, step)
        for (const i of rrange) {
            console.log(`rangez(${start}, ${stop}, ${step})===${i}`)
        }
    }
    /**
     * Use very,very large integer values!
     */
    static p3(): void {
        const start = 1000
        const stop = Number.MAX_SAFE_INTEGER
        const step = 150400300200114
        const rrange = Practice3.rangez(start, stop, step)
        for (const i of rrange) {
            debugFip(`rangez(${start}, ${stop}, ${step})===${i}`)
        }
    }
    /**
     * Use descending values
     */
    static p4(): void {
        const start = -1
        const stop = -5
        const step = -1
        const rrange = Practice3.rangez(start, stop, step)
        const rrange2 = Array.from(rrange);
        const expected = [-1, -2, -3, -4]
        console.log(`isblank: [${Practice3.transform(rrange)}]`)
        console.log(`isgood: [${Practice3.transform(rrange2)}]`)
        console.log(`expected: [${expected}]`)

        /*----------------------------------------------------------------------
        Learning Lesson: consuming an Iterable with a for-loop (or even with an
        Array.from) causes it to be consumed and is not consumable again! Thus,
        transforming the values from an Iterable into an array is almost critical
        for reusing those values.
        */
    }
    /**
     * Use values that cause infinite loop
     */
    static p5(): void {
        const start = 3
        const stop = 9
        const step = -1
        const MAX_LOOPCOUNT = stop + 59
        let loops = start
        const infiniterange = Practice3.rangez(start, stop, step)
        for (const i of infiniterange) {
            console.log(`rangez(${start}, ${stop}, ${step})===${i}`)
            if (loops > MAX_LOOPCOUNT) {
                console.log(`***detected possible infinite loop; break now; ${loops}`)
                break
            }
            else {
                loops += 1;
            }
        }
    }
}

/**
 * ----------------------------------- MAIN -----------------------------------
 */
{
    Practice3.p5()
    // Practice3.p4()
    // Practice3.p3()
    // Practice3.p2()
    // Practice3.p1()
}