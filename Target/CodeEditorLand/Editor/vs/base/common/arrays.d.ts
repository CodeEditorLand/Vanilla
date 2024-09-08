import type { CancellationToken } from "./cancellation.js";
import type { ISplice } from "./sequence.js";
/**
 * Returns the last element of an array.
 * @param array The array.
 * @param n Which element from the end (default is zero).
 */
export declare function tail<T>(array: ArrayLike<T>, n?: number): T | undefined;
export declare function tail2<T>(arr: T[]): [T[], T];
export declare function equals<T>(one: ReadonlyArray<T> | undefined, other: ReadonlyArray<T> | undefined, itemEquals?: (a: T, b: T) => boolean): boolean;
/**
 * Remove the element at `index` by replacing it with the last element. This is faster than `splice`
 * but changes the order of the array
 */
export declare function removeFastWithoutKeepingOrder<T>(array: T[], index: number): void;
/**
 * Performs a binary search algorithm over a sorted array.
 *
 * @param array The array being searched.
 * @param key The value we search for.
 * @param comparator A function that takes two array elements and returns zero
 *   if they are equal, a negative number if the first element precedes the
 *   second one in the sorting order, or a positive number if the second element
 *   precedes the first one.
 * @return See {@link binarySearch2}
 */
export declare function binarySearch<T>(array: ReadonlyArray<T>, key: T, comparator: (op1: T, op2: T) => number): number;
/**
 * Performs a binary search algorithm over a sorted collection. Useful for cases
 * when we need to perform a binary search over something that isn't actually an
 * array, and converting data to an array would defeat the use of binary search
 * in the first place.
 *
 * @param length The collection length.
 * @param compareToKey A function that takes an index of an element in the
 *   collection and returns zero if the value at this index is equal to the
 *   search key, a negative number if the value precedes the search key in the
 *   sorting order, or a positive number if the search key precedes the value.
 * @return A non-negative index of an element, if found. If not found, the
 *   result is -(n+1) (or ~n, using bitwise notation), where n is the index
 *   where the key should be inserted to maintain the sorting order.
 */
export declare function binarySearch2(length: number, compareToKey: (index: number) => number): number;
type Compare<T> = (a: T, b: T) => number;
export declare function quickSelect<T>(nth: number, data: T[], compare: Compare<T>): T;
export declare function groupBy<T>(data: ReadonlyArray<T>, compare: (a: T, b: T) => number): T[][];
/**
 * Splits the given items into a list of (non-empty) groups.
 * `shouldBeGrouped` is used to decide if two consecutive items should be in the same group.
 * The order of the items is preserved.
 */
export declare function groupAdjacentBy<T>(items: Iterable<T>, shouldBeGrouped: (item1: T, item2: T) => boolean): Iterable<T[]>;
export declare function forEachAdjacent<T>(arr: T[], f: (item1: T | undefined, item2: T | undefined) => void): void;
export declare function forEachWithNeighbors<T>(arr: T[], f: (before: T | undefined, element: T, after: T | undefined) => void): void;
/**
 * Diffs two *sorted* arrays and computes the splices which apply the diff.
 */
export declare function sortedDiff<T>(before: ReadonlyArray<T>, after: ReadonlyArray<T>, compare: (a: T, b: T) => number): ISplice<T>[];
/**
 * Takes two *sorted* arrays and computes their delta (removed, added elements).
 * Finishes in `Math.min(before.length, after.length)` steps.
 */
export declare function delta<T>(before: ReadonlyArray<T>, after: ReadonlyArray<T>, compare: (a: T, b: T) => number): {
    removed: T[];
    added: T[];
};
/**
 * Returns the top N elements from the array.
 *
 * Faster than sorting the entire array when the array is a lot larger than N.
 *
 * @param array The unsorted array.
 * @param compare A sort function for the elements.
 * @param n The number of elements to return.
 * @return The first n elements from array when sorted with compare.
 */
export declare function top<T>(array: ReadonlyArray<T>, compare: (a: T, b: T) => number, n: number): T[];
/**
 * Asynchronous variant of `top()` allowing for splitting up work in batches between which the event loop can run.
 *
 * Returns the top N elements from the array.
 *
 * Faster than sorting the entire array when the array is a lot larger than N.
 *
 * @param array The unsorted array.
 * @param compare A sort function for the elements.
 * @param n The number of elements to return.
 * @param batch The number of elements to examine before yielding to the event loop.
 * @return The first n elements from array when sorted with compare.
 */
export declare function topAsync<T>(array: T[], compare: (a: T, b: T) => number, n: number, batch: number, token?: CancellationToken): Promise<T[]>;
/**
 * @returns New array with all falsy values removed. The original array IS NOT modified.
 */
export declare function coalesce<T>(array: ReadonlyArray<T | undefined | null>): T[];
/**
 * Remove all falsy values from `array`. The original array IS modified.
 */
export declare function coalesceInPlace<T>(array: Array<T | undefined | null>): asserts array is Array<T>;
/**
 * @deprecated Use `Array.copyWithin` instead
 */
export declare function move(array: any[], from: number, to: number): void;
/**
 * @returns false if the provided object is an array and not empty.
 */
export declare function isFalsyOrEmpty(obj: any): boolean;
/**
 * @returns True if the provided object is an array and has at least one element.
 */
export declare function isNonEmptyArray<T>(obj: T[] | undefined | null): obj is T[];
export declare function isNonEmptyArray<T>(obj: readonly T[] | undefined | null): obj is readonly T[];
/**
 * Removes duplicates from the given array. The optional keyFn allows to specify
 * how elements are checked for equality by returning an alternate value for each.
 */
export declare function distinct<T>(array: ReadonlyArray<T>, keyFn?: (value: T) => any): T[];
export declare function uniqueFilter<T, R>(keyFn: (t: T) => R): (t: T) => boolean;
export declare function commonPrefixLength<T>(one: ReadonlyArray<T>, other: ReadonlyArray<T>, equals?: (a: T, b: T) => boolean): number;
export declare function range(to: number): number[];
export declare function range(from: number, to: number): number[];
export declare function index<T>(array: ReadonlyArray<T>, indexer: (t: T) => string): {
    [key: string]: T;
};
export declare function index<T, R>(array: ReadonlyArray<T>, indexer: (t: T) => string, mapper: (t: T) => R): {
    [key: string]: R;
};
/**
 * Inserts an element into an array. Returns a function which, when
 * called, will remove that element from the array.
 *
 * @deprecated In almost all cases, use a `Set<T>` instead.
 */
export declare function insert<T>(array: T[], element: T): () => void;
/**
 * Removes an element from an array if it can be found.
 *
 * @deprecated In almost all cases, use a `Set<T>` instead.
 */
export declare function remove<T>(array: T[], element: T): T | undefined;
/**
 * Insert `insertArr` inside `target` at `insertIndex`.
 * Please don't touch unless you understand https://jsperf.com/inserting-an-array-within-an-array
 */
export declare function arrayInsert<T>(target: T[], insertIndex: number, insertArr: T[]): T[];
/**
 * Uses Fisher-Yates shuffle to shuffle the given array
 */
export declare function shuffle<T>(array: T[], _seed?: number): void;
/**
 * Pushes an element to the start of the array, if found.
 */
export declare function pushToStart<T>(arr: T[], value: T): void;
/**
 * Pushes an element to the end of the array, if found.
 */
export declare function pushToEnd<T>(arr: T[], value: T): void;
export declare function pushMany<T>(arr: T[], items: ReadonlyArray<T>): void;
export declare function mapArrayOrNot<T, U>(items: T | T[], fn: (_: T) => U): U | U[];
export declare function asArray<T>(x: T | T[]): T[];
export declare function asArray<T>(x: T | readonly T[]): readonly T[];
export declare function getRandomElement<T>(arr: T[]): T | undefined;
/**
 * Insert the new items in the array.
 * @param array The original array.
 * @param start The zero-based location in the array from which to start inserting elements.
 * @param newItems The items to be inserted
 */
export declare function insertInto<T>(array: T[], start: number, newItems: T[]): void;
/**
 * Removes elements from an array and inserts new elements in their place, returning the deleted elements. Alternative to the native Array.splice method, it
 * can only support limited number of items due to the maximum call stack size limit.
 * @param array The original array.
 * @param start The zero-based location in the array from which to start removing elements.
 * @param deleteCount The number of elements to remove.
 * @returns An array containing the elements that were deleted.
 */
export declare function splice<T>(array: T[], start: number, deleteCount: number, newItems: T[]): T[];
/**
 * When comparing two values,
 * a negative number indicates that the first value is less than the second,
 * a positive number indicates that the first value is greater than the second,
 * and zero indicates that neither is the case.
 */
export type CompareResult = number;
export declare namespace CompareResult {
    function isLessThan(result: CompareResult): boolean;
    function isLessThanOrEqual(result: CompareResult): boolean;
    function isGreaterThan(result: CompareResult): boolean;
    function isNeitherLessOrGreaterThan(result: CompareResult): boolean;
    const greaterThan = 1;
    const lessThan = -1;
    const neitherLessOrGreaterThan = 0;
}
/**
 * A comparator `c` defines a total order `<=` on `T` as following:
 * `c(a, b) <= 0` iff `a` <= `b`.
 * We also have `c(a, b) == 0` iff `c(b, a) == 0`.
 */
export type Comparator<T> = (a: T, b: T) => CompareResult;
export declare function compareBy<TItem, TCompareBy>(selector: (item: TItem) => TCompareBy, comparator: Comparator<TCompareBy>): Comparator<TItem>;
export declare function tieBreakComparators<TItem>(...comparators: Comparator<TItem>[]): Comparator<TItem>;
/**
 * The natural order on numbers.
 */
export declare const numberComparator: Comparator<number>;
export declare const booleanComparator: Comparator<boolean>;
export declare function reverseOrder<TItem>(comparator: Comparator<TItem>): Comparator<TItem>;
export declare class ArrayQueue<T> {
    private readonly items;
    private firstIdx;
    private lastIdx;
    /**
     * Constructs a queue that is backed by the given array. Runtime is O(1).
     */
    constructor(items: readonly T[]);
    get length(): number;
    /**
     * Consumes elements from the beginning of the queue as long as the predicate returns true.
     * If no elements were consumed, `null` is returned. Has a runtime of O(result.length).
     */
    takeWhile(predicate: (value: T) => boolean): T[] | null;
    /**
     * Consumes elements from the end of the queue as long as the predicate returns true.
     * If no elements were consumed, `null` is returned.
     * The result has the same order as the underlying array!
     */
    takeFromEndWhile(predicate: (value: T) => boolean): T[] | null;
    peek(): T | undefined;
    peekLast(): T | undefined;
    dequeue(): T | undefined;
    removeLast(): T | undefined;
    takeCount(count: number): T[];
}
/**
 * This class is faster than an iterator and array for lazy computed data.
 */
export declare class CallbackIterable<T> {
    /**
     * Calls the callback for every item.
     * Stops when the callback returns false.
     */
    readonly iterate: (callback: (item: T) => boolean) => void;
    static readonly empty: CallbackIterable<never>;
    constructor(
    /**
     * Calls the callback for every item.
     * Stops when the callback returns false.
     */
    iterate: (callback: (item: T) => boolean) => void);
    forEach(handler: (item: T) => void): void;
    toArray(): T[];
    filter(predicate: (item: T) => boolean): CallbackIterable<T>;
    map<TResult>(mapFn: (item: T) => TResult): CallbackIterable<TResult>;
    some(predicate: (item: T) => boolean): boolean;
    findFirst(predicate: (item: T) => boolean): T | undefined;
    findLast(predicate: (item: T) => boolean): T | undefined;
    findLastMaxBy(comparator: Comparator<T>): T | undefined;
}
/**
 * Represents a re-arrangement of items in an array.
 */
export declare class Permutation {
    private readonly _indexMap;
    constructor(_indexMap: readonly number[]);
    /**
     * Returns a permutation that sorts the given array according to the given compare function.
     */
    static createSortPermutation<T>(arr: readonly T[], compareFn: (a: T, b: T) => number): Permutation;
    /**
     * Returns a new array with the elements of the given array re-arranged according to this permutation.
     */
    apply<T>(arr: readonly T[]): T[];
    /**
     * Returns a new permutation that undoes the re-arrangement of this permutation.
     */
    inverse(): Permutation;
}
/**
 * Asynchronous variant of `Array.find()`, returning the first element in
 * the array for which the predicate returns true.
 *
 * This implementation does not bail early and waits for all promises to
 * resolve before returning.
 */
export declare function findAsync<T>(array: readonly T[], predicate: (element: T, index: number) => Promise<boolean>): Promise<T | undefined>;
export {};
