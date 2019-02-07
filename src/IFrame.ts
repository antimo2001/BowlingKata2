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
     * Returns true iff frame is done scoring
     */
    doneScoring(): boolean;

    /**
     * Get the base throws
     */
    getBaseThrows(): number[];
}