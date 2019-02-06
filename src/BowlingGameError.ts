/**
 * Class represents a BowlingGame exception
 */
export class BowlingGameError extends Error {
    constructor(message: string) {
        super(message);
        //Practicing subclasses of Typescript's Error class see the following
        //potential issue; https://stackoverflow.com/questions/41102060/typescript-extending-error-class

        // Set the prototype explicitly.
        // Object.setPrototypeOf(this, BowlingGameError.prototype);
    }
}
