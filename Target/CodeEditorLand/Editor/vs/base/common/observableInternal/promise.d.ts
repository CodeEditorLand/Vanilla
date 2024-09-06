import { CancellationToken } from "../cancellation.js";
import { IObservable, IReader } from "./base.js";
export declare class ObservableLazy<T> {
    private readonly _computeValue;
    private readonly _value;
    /**
     * The cached value.
     * Does not force a computation of the value.
     */
    get cachedValue(): IObservable<T | undefined>;
    constructor(_computeValue: () => T);
    /**
     * Returns the cached value.
     * Computes the value if the value has not been cached yet.
     */
    getValue(): T;
}
/**
 * A promise whose state is observable.
 */
export declare class ObservablePromise<T> {
    static fromFn<T>(fn: () => Promise<T>): ObservablePromise<T>;
    private readonly _value;
    /**
     * The promise that this object wraps.
     */
    readonly promise: Promise<T>;
    /**
     * The current state of the promise.
     * Is `undefined` if the promise didn't resolve yet.
     */
    readonly promiseResult: IObservable<PromiseResult<T> | undefined>;
    constructor(promise: Promise<T>);
}
export declare class PromiseResult<T> {
    /**
     * The value of the resolved promise.
     * Undefined if the promise rejected.
     */
    readonly data: T | undefined;
    /**
     * The error in case of a rejected promise.
     * Undefined if the promise resolved.
     */
    readonly error: unknown | undefined;
    constructor(
    /**
     * The value of the resolved promise.
     * Undefined if the promise rejected.
     */
    data: T | undefined, 
    /**
     * The error in case of a rejected promise.
     * Undefined if the promise resolved.
     */
    error: unknown | undefined);
    /**
     * Returns the value if the promise resolved, otherwise throws the error.
     */
    getDataOrThrow(): T;
}
/**
 * A lazy promise whose state is observable.
 */
export declare class ObservableLazyPromise<T> {
    private readonly _computePromise;
    private readonly _lazyValue;
    /**
     * Does not enforce evaluation of the promise compute function.
     * Is undefined if the promise has not been computed yet.
     */
    readonly cachedPromiseResult: IObservable<PromiseResult<T> | undefined, unknown>;
    constructor(_computePromise: () => Promise<T>);
    getPromise(): Promise<T>;
}
/**
 * Resolves the promise when the observables state matches the predicate.
 */
export declare function waitForState<T>(observable: IObservable<T | null | undefined>): Promise<T>;
export declare function waitForState<T, TState extends T>(observable: IObservable<T>, predicate: (state: T) => state is TState, isError?: (state: T) => boolean | unknown | undefined, cancellationToken?: CancellationToken): Promise<TState>;
export declare function waitForState<T>(observable: IObservable<T>, predicate: (state: T) => boolean, isError?: (state: T) => boolean | unknown | undefined, cancellationToken?: CancellationToken): Promise<T>;
export declare function derivedWithCancellationToken<T>(computeFn: (reader: IReader, cancellationToken: CancellationToken) => T): IObservable<T>;
export declare function derivedWithCancellationToken<T>(owner: object, computeFn: (reader: IReader, cancellationToken: CancellationToken) => T): IObservable<T>;
