import { CancellationToken } from "./cancellation.js";
import { IDisposable } from "./lifecycle.js";
export interface CacheResult<T> extends IDisposable {
    promise: Promise<T>;
}
export declare class Cache<T> {
    private task;
    private result;
    constructor(task: (ct: CancellationToken) => Promise<T>);
    get(): CacheResult<T>;
}
export declare function identity<T>(t: T): T;
interface ICacheOptions<TArg> {
    /**
     * The cache key is used to identify the cache entry.
     * Strict equality is used to compare cache keys.
     */
    getCacheKey: (arg: TArg) => unknown;
}
/**
 * Uses a LRU cache to make a given parametrized function cached.
 * Caches just the last key/value.
 */
export declare class LRUCachedFunction<TArg, TComputed> {
    private lastCache;
    private lastArgKey;
    private readonly _fn;
    private readonly _computeKey;
    constructor(fn: (arg: TArg) => TComputed);
    constructor(options: ICacheOptions<TArg>, fn: (arg: TArg) => TComputed);
    get(arg: TArg): TComputed;
}
/**
 * Uses an unbounded cache to memoize the results of the given function.
 */
export declare class CachedFunction<TArg, TComputed> {
    private readonly _map;
    private readonly _map2;
    get cachedValues(): ReadonlyMap<TArg, TComputed>;
    private readonly _fn;
    private readonly _computeKey;
    constructor(fn: (arg: TArg) => TComputed);
    constructor(options: ICacheOptions<TArg>, fn: (arg: TArg) => TComputed);
    get(arg: TArg): TComputed;
}
export {};
