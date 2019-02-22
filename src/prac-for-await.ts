import debug from 'debug'
const debugFip = debug('src:prac-for-await')

let debugCount = 0

/**
 * Simulate typical web-service API operations. Note a namespace in typescript is
 * like a class with only static methods.
 */
namespace EpicWebService {

    /**
     * Delay some async operation (useful for simulating slow async functions)
     * @param delay amount of time in milliseconds to delay; defaults to 3000
     */
    export async function stall(delay: number = 3000): Promise<void> {
        return await new Promise(resolve => setTimeout(resolve, delay))

        //Credit for the above code goes to this online source:
        //https://staxmanade.com/2016/07/easily-simulate-slow-async-calls-using-javascript-async-await/
    }

    /**
     * Helper function to debug asynchronously
     * @param message debug message
     * @param delay time in ms to delay; defaults to 3000
     */
    export async function debugLogAsync(message: string, delay = 3000): Promise<void> {
        //Wrap the sync function debugFip around a function that creates a Promise
        return await EpicWebService.stall(delay).then(() => {
            debugCount += 1
            debugFip(`${debugCount}: ${message}`)
            console.log(`${debugCount}: ${message}`)
        })
    }

    export async function fetchUser(message: string): Promise<string> {
        return EpicWebService.debugLogAsync(message, 100).then(() => {
            return 'done fetchUser()'
        })
    }
    export async function createUser(message: string): Promise<string> {
        return EpicWebService.debugLogAsync(message, 200).then(() => {
            return 'done createUser()'
        })
    }
    export async function deleteUser(message: string): Promise<string> {
        return EpicWebService.debugLogAsync(message, 300).then(() => {
            return 'done deleteUser()'
        })
    }
    export async function fetchAll(message: string): Promise<string> {
        return EpicWebService.debugLogAsync(message, 400).then(() => {
            return 'done fetchAll()'
        })
    }
}

/**
 * Flags to use to toggle which practice function to use
 */
enum Toggle {
    One = 1,
    Two,
    Three,
    Four
}

/**
 * Bunch of functions to practice the new for-await construct
 */
export class Practice1 {

    /**
    * This practice function iterates thru async operations poorly! (no for-await construct)
    * Note the iteration is somewhat unpredicatable because the async functions do
    * not end in the same order as you read the code (the async functions only get
    * started but may not finish before the entire for-loop ends)
    * @param arr array of numbers or array of strings
    */
    static funcNoAwait(arr: number[] | string[]) {
        console.log(`01: begin loop (no await)`)
        for (let n of arr) {
            console.log(`loop1: begin iteration ${n}`)
            EpicWebService.fetchUser(`loop1: fetchUser(${n})(100)`)
            EpicWebService.fetchAll(`loop1: fetchAll(${n})(400)`)
            EpicWebService.createUser(`loop1: createUser(${n})(200)`)
            console.log(`loop1: END iteration ${n}`)
        }
        console.log(`01: END loop (no await)`)
    }

    /**
     * This practice function iterates using the for-await construct.
     * This is an example of how to iterate async operations in a series.
     * @param arr array of numbers or array of strings
     */
    static async funcForAwaitInSeries(arr: number[] | string[]) {
        console.log(`02: begin loop to do for-await!`)
        for await (let n2 of arr) {
            console.log(`loop2: begin iteration ${n2}`)
            await EpicWebService.fetchUser(`loop2: fetchUser(${n2})(100)`)
            await EpicWebService.fetchAll(`loop2: fetchAll(${n2})(400)`)
            await EpicWebService.createUser(`loop2: createUser(${n2})(200)`)
            console.log(`loop2: END iteration ${n2}`)
        }
        console.log(`02: END loop to do for-await!`)
    }

    /**
     * This practice function iterates using the for-await construct.
     * This is an example of how to iterate async operations in parallel.
     * @param arr array of numbers or array of strings
     */
    static async funcForAwaitParallel(arr: number[] | string[]) {
        console.log(`03: begin loop to do for-await in parallel!`)
        for await (let n3 of arr) {
            console.log(`loop3: begin iteration ${n3}`)
            //Use Promise.all() to execute promises concurrently
            const fetchAllThenCreate = Promise.all([
                EpicWebService.fetchAll(`loop3: fetchAll(${n3})(400)`),
                EpicWebService.fetchUser(`loop3: fetchUser(${n3})(100)`)
            ]).then((results) => {
                const [au, ur] = results
                console.log(`results: [${au}, ${ur}]`)
                console.log(`done Promise.all()`)
            }).then(() => {
                return EpicWebService.createUser(`loop3: createUser(${n3})(200)`)
            })
            await fetchAllThenCreate
            console.log(`loop3: END iteration ${n3}`)
        }
        console.log(`03: END loop to do for-await!`)
    }

    /**
     * This practice function iterates using the for-await construct.
     * This is an example of how to iterate async operations in parallel and using
     * more awaits as opposed to using Promise chains. So, this should output the same
     * console logs as the function above in the exact same order.
     * @param arr array of numbers or array of strings
     */
    static async funcForAwaitParallelAgain(arr: number[] | string[]) {
        console.log(`04: begin loop to do for-await in parallel!`)
        for await (let n4 of arr) {
            console.log(`loop4: begin iteration ${n4}`)
            const fetchAll = Promise.all([
                EpicWebService.fetchAll(`loop4: fetchAll(${n4})(400)`),
                EpicWebService.fetchUser(`loop4: fetchUser(${n4})(100)`)
            ])
            //Fetch the user data concurrently and destruct the results
            const [all, user] = await fetchAll
            console.log(`results: [${all}, ${user}]`)
            console.log(`done Promise.all()`)
            await EpicWebService.createUser(`loop4: createUser(${n4})(200)`)
            console.log(`loop4: END iteration ${n4}`)
        }
        console.log(`04: END loop to do for-await!`)
    }

    static async main(toggle: Toggle) {
        const arr = ['one', 'two2']
        switch (toggle) {
            case Toggle.Four:
                await Practice1.funcForAwaitParallelAgain(arr)
                break
            case Toggle.Three:
                await Practice1.funcForAwaitParallel(arr)
                break
            case Toggle.Two:
                await Practice1.funcForAwaitInSeries(arr)
                break
            case Toggle.One:
                Practice1.funcNoAwait(arr)
                break
            default:
                console.log(`...unexpected default case was used`)
                break
        }
    }
}


/*
* Learning lessons:
* 1. I had an older version of Nodejs installed(v8.12); I got a TypeError
*    so I had to install Nodejs v10+ to fix that TypeError.
* 2. It seems like all of the awaits are put in to the Nodejs callback queue.
* 3. When inside of the for-await loop, and I use await debugLogAsync(), then
*    the order of the iteration occurs in a stable way!!
* 4. Note that carelessly using `await` on everything is poor practice! It is
*    best practice to learn when to use your promise library; specifically
*    learn about Promise.all(), Promise.race(), Promise.map(), etc.
* 5. Lots of lessons learned with this online source: https://javascript.info/async-await
* 6. The async keyword before a function has two effects: (1) Makes the
*    function always return a promise. (2) Allows to use await in it.
* 7. Use of the `await` keyword inside an async function is OPTIONAL.
*/
;(async function() {
    await Practice1.main(Toggle.Four)
}());

