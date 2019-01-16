import debug from 'debug';
const debugFip = debug('src:prac-for-await');

let debugCount = 0;

/**
 * Delay some async operation (useful for simulating slow async functions)
 * @param delay amount of time in milliseconds to delay; defaults to 3000
 */
async function stall(delay: number = 3000): Promise<void> {
    return await new Promise(resolve => setTimeout(resolve, delay));

    //Credit for the above code goes to this online source:
    //https://staxmanade.com/2016/07/easily-simulate-slow-async-calls-using-javascript-async-await/
}

/**
 * Helper function to debug asynchronously
 * @param message debug message
 * @param delay time in ms to delay; defaults to 3000
 */
async function debugLogAsync(message: string, delay = 3000): Promise<void> {
    //Wrap the sync function debugFip around a function that creates a Promise
    return await stall(delay).then(() => {
        debugCount += 1;
        // debugFip(`${debugCount}: ${message}`);
        console.log(`${debugCount}: ${message}`);
    });
}

/**
 * Simulate typical web-service API operations.
 */
const epicWebService = {
    fetchUser: async (message: string): Promise<string> => {
        return debugLogAsync(message, 100).then(() => {
            return 'done fetchUser()';
        });
    },
    createUser: async (message: string): Promise<string> => {
        return debugLogAsync(message, 200).then(() => {
            return 'done createUser()';
        });
    },
    deleteUser: async (message: string): Promise<string> => {
        return debugLogAsync(message, 300).then(() => {
            return 'done deleteUser()';
        });
    },
    fetchAll: async (message: string): Promise<string> => {
        return debugLogAsync(message, 400).then(() => {
            return 'done fetchAll()';
        });
    }
};

/**
 * This practice function iterates thru async operations poorly! (no for-await construct)
 * Note the iteration is somewhat unpredicatable because the async functions do
 * not end in the same order as you read the code (the async functions only get
 * started but may not finish before the entire for-loop ends)
 * @param arr array of numbers or array of strings
 */
function funcNoAwait(arr: number[] | string[]) {
    /*
    * Without the for-await, I expect to see the console.logs first? Yes.
    */
    console.log(`01: begin loop (no await)`);
    for (let n of arr) {
        epicWebService.fetchUser(`loop1: fetchUser(${n})(100)`);
        epicWebService.fetchAll(`loop1: fetchAll(${n})(444)`);
        epicWebService.createUser(`loop1: createUser(${n})(200)`);
        console.log(`loop1: console: value: ${n}`);
    }
    console.log(`01: END loop (no await)`);
}

/**
 * This practice function iterates using the for-await construct.
 * This is an example of how to iterate async operations in a series.
 * NTS: how would I do async operations in parallel? Just NOT use the await?
 * @param arr array of numbers or array of strings
 */
async function funcForAwaitInSeries(arr: number[] | string[]) {
    /*
    * Using the for-await, I expect to see the console.logs interweaved with async logs? NOPE
    */
    console.log(`02: begin loop to do for-await!`);
    for await (let n2 of arr) {
        await epicWebService.fetchUser(`loop2: fetchUser(${n2})(100)`);
        await epicWebService.fetchAll(`loop2: fetchAll(${n2})(444)`);
        await epicWebService.createUser(`loop2: createUser(${n2})(200)`);
        console.log(`loop2: console: value: ${n2}`);
    }
    console.log(`02: END loop to do for-await!`);
}

async function funcForAwaitParallel(arr: number[] | string[]) {
    console.log(`03: begin loop to do for-await in parallel!`);
    for await (let n3 of arr) {
        const allUsers = epicWebService.fetchAll(`loop2: fetchAll(${n3})(444)`);
        const user = epicWebService.fetchUser(`loop2: fetchUser(${n3})(100)`);
        //Use Promise.all() to execute promises concurrently!
        const fetchAll = Promise.all([allUsers, user]);
        const promiseChain = fetchAll.then((results) => {
            const [au, ur] = results;
            console.log(`results: [${au}, ${ur}]`);
            console.log(`done Promise.all()`);
        }).then(() => {
            return epicWebService.createUser(`loop2: createUser(${n3})(200)`);
        });
        await promiseChain;
        console.log(`loop3: console: value: ${n3}`);
    }
    console.log(`03: END loop to do for-await!`);
}

/**
 * ----------------------------------- MAIN -----------------------------------
 */
;(async function main() {
    const PRACTICE_TOGGLE: string = 'practice3';
    const arr = ['one', 'two2'];

    switch (PRACTICE_TOGGLE) {
        case 'practice1':
            funcNoAwait(arr);
            break;
        case 'practice2':
            await funcForAwaitInSeries(arr);
            break;
        case 'practice3':
            await funcForAwaitParallel(arr);
            break;
        default:
            break;
    }

    /*
    * Learning lessons:
    * 1. I had an older version of Nodejs installed(v8.12); I got a TypeError;
    *    so I had to install Nodejs v10+ to fix that TypeError.
    * 2. It seems like all of the awaits are put in to the Nodejs callback queue.
    * 3. When inside of the for-await loop, and I use await debugLogAsync(), then
    *    the order of the iteration occurs in a stable way!!
    * 4. Note that carelessly using `await` on everything is poor practice! It is
    *    best practice to learn when to use your promise library; specifically
    *    learn about Promise.all(), Promise.race(), Promise.map(), etc.
    */

}());