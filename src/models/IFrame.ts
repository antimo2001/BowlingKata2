/**
 * This interface represents a frame in a bowling game.
 */
export interface IFrame {

    /**
     * Gets the score for this frame.
     */
    getScore(): number;

    /**
     * Sets the bonusThrows.
     * @param bonusThrows this rest args contains the array of bonus throws
     */
    setBonusThrows(...bonusThrows: number[]): void;

    /**
     * Gets the hasBeenScored property
     */
    hasBeenScored: boolean;

    /**
     * Gets the base throws property
     */
    baseThrows: number[];
}