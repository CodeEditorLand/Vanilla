import type { Comparator } from "./arrays.js";
export declare function findLast<T>(array: readonly T[], predicate: (item: T) => boolean): T | undefined;
export declare function findLastIdx<T>(array: readonly T[], predicate: (item: T) => boolean, fromIndex?: number): number;
/**
 * Finds the last item where predicate is true using binary search.
 * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[true, ..., true, false, ..., false]`!
 *
 * @returns `undefined` if no item matches, otherwise the last item that matches the predicate.
 */
export declare function findLastMonotonous<T>(array: readonly T[], predicate: (item: T) => boolean): T | undefined;
/**
 * Finds the last item where predicate is true using binary search.
 * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[true, ..., true, false, ..., false]`!
 *
 * @returns `startIdx - 1` if predicate is false for all items, otherwise the index of the last item that matches the predicate.
 */
export declare function findLastIdxMonotonous<T>(array: readonly T[], predicate: (item: T) => boolean, startIdx?: number, endIdxEx?: number): number;
/**
 * Finds the first item where predicate is true using binary search.
 * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[false, ..., false, true, ..., true]`!
 *
 * @returns `undefined` if no item matches, otherwise the first item that matches the predicate.
 */
export declare function findFirstMonotonous<T>(array: readonly T[], predicate: (item: T) => boolean): T | undefined;
/**
 * Finds the first item where predicate is true using binary search.
 * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[false, ..., false, true, ..., true]`!
 *
 * @returns `endIdxEx` if predicate is false for all items, otherwise the index of the first item that matches the predicate.
 */
export declare function findFirstIdxMonotonousOrArrLen<T>(array: readonly T[], predicate: (item: T) => boolean, startIdx?: number, endIdxEx?: number): number;
export declare function findFirstIdxMonotonous<T>(array: readonly T[], predicate: (item: T) => boolean, startIdx?: number, endIdxEx?: number): number;
/**
 * Use this when
 * * You have a sorted array
 * * You query this array with a monotonous predicate to find the last item that has a certain property.
 * * You query this array multiple times with monotonous predicates that get weaker and weaker.
 */
export declare class MonotonousArray<T> {
    private readonly _array;
    static assertInvariants: boolean;
    private _findLastMonotonousLastIdx;
    private _prevFindLastPredicate;
    constructor(_array: readonly T[]);
    /**
     * The predicate must be monotonous, i.e. `arr.map(predicate)` must be like `[true, ..., true, false, ..., false]`!
     * For subsequent calls, current predicate must be weaker than (or equal to) the previous predicate, i.e. more entries must be `true`.
     */
    findLastMonotonous(predicate: (item: T) => boolean): T | undefined;
}
/**
 * Returns the first item that is equal to or greater than every other item.
 */
export declare function findFirstMax<T>(array: readonly T[], comparator: Comparator<T>): T | undefined;
/**
 * Returns the last item that is equal to or greater than every other item.
 */
export declare function findLastMax<T>(array: readonly T[], comparator: Comparator<T>): T | undefined;
/**
 * Returns the first item that is equal to or less than every other item.
 */
export declare function findFirstMin<T>(array: readonly T[], comparator: Comparator<T>): T | undefined;
export declare function findMaxIdx<T>(array: readonly T[], comparator: Comparator<T>): number;
/**
 * Returns the first mapped value of the array which is not undefined.
 */
export declare function mapFindFirst<T, R>(items: Iterable<T>, mapFn: (value: T) => R | undefined): R | undefined;
