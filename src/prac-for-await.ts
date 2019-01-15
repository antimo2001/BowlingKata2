import debug from 'debug';
const debugFip = debug('fip00:src:prac-for-await');

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
async function debugFipAsync(message: string, delay = 3000): Promise<void> {
    //Wrap the sync function debugFip around a function that creates a Promise
    return await stall(delay).then(() => {
        debugFip(message);
    });
}

function funcNoAwait(nums: number[]) {
    /*
    * Without the for-await, I expect to see the console.logs first? Yes
    */
    console.log(`01: begin loop (no await)`);
    for (let n of nums) {
        debugFipAsync(`loop1: n===${n}`, 1000);
        debugFipAsync(`loop1: 2*n===${2*n}`, 200);
        debugFipAsync(`loop1: 3*n===${3*n}`, 333);
        debugFipAsync(`loop1: 4*n===${4*n}`, 4444);
        debugFipAsync(`loop1: 5*n===${5*n}`, 50);
        console.log(`loop1 console: number: ${n}`);
    }
}

async function funcForAwait(nums: number[]) {
    /*
    * Using the for-await, I expect to see the console.logs interweaved with async logs? NOPE
    */
    console.log(`02: begin loop to do for-await!`);
    for await (let n2 of nums) {
        debugFipAsync(`loop2: n2===${n2}`, 1000);
        debugFipAsync(`loop2: 2*n2===${2 * n2}`, 200);
        debugFipAsync(`loop2: 3*n2===${3 * n2}`, 200);
        debugFipAsync(`loop2: 4*n2===${4 * n2}`, 200);
        debugFipAsync(`loop2: 5*n2===${5 * n2}`, 200);
        console.log(`loop2: console: number: ${n2}`);
    }
}

(async function main() {
    let nums = [1, 2, 3];
    funcNoAwait(nums);
    await funcForAwait(nums);

    /*
    * Learning lessons:
    * 1. I had an older version of Nodejs installed(v8.12); I got a TypeError; so I had to install Nodejs v10 + to fix that TypeError.
    * 2. It seems like all of the awaits are put in to the Nodejs callback - queue.
    */

}());