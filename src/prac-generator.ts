import debug from 'debug'
const debugFip = debug("src:prac-generator")

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
        debugFip(`END range`)
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
        const end = 9
        const rrange = Practice3.rangez(start, end)
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
        const rrange = Practice3.rangez(start, end, step)
        for (const i of rrange) {
            console.log(`range(${start}, ${end}, ${step})===${i}`)
        }
    }
    /**
     * Use very,very large integer values!
     */
    static p3(): void {
        const start = 1000
        const end = Number.MAX_SAFE_INTEGER
        const step = 150400300200114
        const rrange = Practice3.rangez(start, end, step)
        for (const i of rrange) {
            debugFip(`range(${start}, ${end}, ${step})===${i}`)
        }
    }
    /**
     * Use descending values
     */
    static p4(): void {
        const start = -1
        const end = -5
        const step = -1
        const rrange = Practice3.rangez(start, end, step)
        const expected = [-1, -2, -3, -4]
        debugFip(`expected===${expected}`)
        debugFip(`transform(rrange)===${Practice3.transform(rrange)}`)

        /*----------------------------------------------------------------------
        Learning Lesson: consuming an Iterable with a for-loop causes it to be
        consumed and is not consumable again! Thus, transforming the values from
        an Iterable into an array is almost critical for reusing those values.
        */
    }
    /**
     * Use values that cause infinite loop
     */
    static p5(): void {
        const start = -1
        const end = -5
        const step = 1
        const MAX_LOOPCOUNT = 99
        let loopcount = 0
        const evilrange = Practice3.rangez(start, end, step)
        for (const i of evilrange) {
            console.log(`range(${start}, ${end}, ${step})===${i}`)
            if (++loopcount >= MAX_LOOPCOUNT) {
                console.log(`***detected possible infinite loop; break now`)
                break
            }
        }
    }
}

/**
 * ----------------------------------- MAIN -----------------------------------
 */
{
    Practice3.p5();
    // Practice3.p4();
    // Practice3.p3();
    // Practice3.p2();
    // Practice3.p1();
}