/**
 * generic utility functions
 */

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 * Returns a new array instance, does not mutate the original.
 */
export function shuffleArray<T>(array: T[]): T[] {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}
