/**
 * This interface represents a frame in a bowling game.
 */
export interface IFrame {

    /**
     * Gets the score for this frame.
     */
    score: number;

    /**
     * Gets the hasBeenScored property
     */
    hasBeenScored: boolean;

    /**
     * Gets the base throws property
     */
    baseThrows: number[];

    /**
     * Sets the bonusThrows.
     * @param bonusThrows this rest args contains the array of bonus throws
     */
    setBonusThrows(...bonusThrows: number[]): void;

    /**
     * Raise errors if the throws for this frame are invalid. Returns true if no
     * errors occurred.
     */
    validateThrows(): boolean;

}