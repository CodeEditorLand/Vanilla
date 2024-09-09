/**
 * An interface for a JavaScript object that
 * acts a dictionary. The keys are strings.
 */
export type IStringDictionary<V> = Record<string, V>;
/**
 * An interface for a JavaScript object that
 * acts a dictionary. The keys are numbers.
 */
export type INumberDictionary<V> = Record<number, V>;
/**
 * Groups the collection into a dictionary based on the provided
 * group function.
 */
export declare function groupBy<K extends string | number | symbol, V>(data: V[], groupFn: (element: V) => K): Record<K, V[]>;
export declare function diffSets<T>(before: Set<T>, after: Set<T>): {
    removed: T[];
    added: T[];
};
export declare function diffMaps<K, V>(before: Map<K, V>, after: Map<K, V>): {
    removed: V[];
    added: V[];
};
/**
 * Computes the intersection of two sets.
 *
 * @param setA - The first set.
 * @param setB - The second iterable.
 * @returns A new set containing the elements that are in both `setA` and `setB`.
 */
export declare function intersection<T>(setA: Set<T>, setB: Iterable<T>): Set<T>;
export declare class SetWithKey<T> implements Set<T> {
    private toKey;
    private _map;
    constructor(values: T[], toKey: (t: T) => any);
    get size(): number;
    add(value: T): this;
    delete(value: T): boolean;
    has(value: T): boolean;
    entries(): IterableIterator<[T, T]>;
    keys(): IterableIterator<T>;
    values(): IterableIterator<T>;
    clear(): void;
    forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void;
    [Symbol.iterator](): IterableIterator<T>;
    [Symbol.toStringTag]: string;
}
