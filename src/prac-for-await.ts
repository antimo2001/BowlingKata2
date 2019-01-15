import debug from 'debug';
const debugFip = debug('fip00:src:prac-for-await');

let timeoutPointer: number;

async function debugFipAsync(message: string): Promise<void> {
    return new Promise(function(resolve, reject) {
        timeoutPointer = setTimeout(function() {
            debugFip(message);
            resolve();
        }, 1000);
    });
}

(async function() {
    let rr = [1, 2, 3];
    for await (let n of rr) {
        debugFipAsync(`number: ${n}`);
    }
}());