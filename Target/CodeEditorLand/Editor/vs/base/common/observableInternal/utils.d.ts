import { EqualityComparer } from "../equals.js";
import { Event, IValueWithChangeEvent } from "../event.js";
import { DisposableStore, IDisposable } from "../lifecycle.js";
import { BaseObservable, IObservable, IObserver, IReader, ITransaction } from "./base.js";
import { DebugNameData, DebugOwner, IDebugNameData } from "./debugName.js";
/**
 * Represents an efficient observable whose value never changes.
 */
export declare function constObservable<T>(value: T): IObservable<T>;
export declare function observableFromPromise<T>(promise: Promise<T>): IObservable<{
    value?: T;
}>;
export declare function observableFromEvent<T, TArgs = unknown>(owner: DebugOwner, event: Event<TArgs>, getValue: (args: TArgs | undefined) => T): IObservable<T>;
export declare function observableFromEvent<T, TArgs = unknown>(event: Event<TArgs>, getValue: (args: TArgs | undefined) => T): IObservable<T>;
export declare function observableFromEventOpts<T, TArgs = unknown>(options: IDebugNameData & {
    equalsFn?: EqualityComparer<T>;
}, event: Event<TArgs>, getValue: (args: TArgs | undefined) => T): IObservable<T>;
export declare class FromEventObservable<TArgs, T> extends BaseObservable<T> {
    private readonly _debugNameData;
    private readonly event;
    readonly _getValue: (args: TArgs | undefined) => T;
    private readonly _getTransaction;
    private readonly _equalityComparator;
    static globalTransaction: ITransaction | undefined;
    private value;
    private hasValue;
    private subscription;
    constructor(_debugNameData: DebugNameData, event: Event<TArgs>, _getValue: (args: TArgs | undefined) => T, _getTransaction: () => ITransaction | undefined, _equalityComparator: EqualityComparer<T>);
    private getDebugName;
    get debugName(): string;
    protected onFirstObserverAdded(): void;
    private readonly handleEvent;
    protected onLastObserverRemoved(): void;
    get(): T;
}
export declare namespace observableFromEvent {
    const Observer: typeof FromEventObservable;
    function batchEventsGlobally(tx: ITransaction, fn: () => void): void;
}
export declare function observableSignalFromEvent(debugName: string, event: Event<any>): IObservable<void>;
/**
 * Creates a signal that can be triggered to invalidate observers.
 * Signals don't have a value - when they are triggered they indicate a change.
 * However, signals can carry a delta that is passed to observers.
 */
export declare function observableSignal<TDelta = void>(debugName: string): IObservableSignal<TDelta>;
export declare function observableSignal<TDelta = void>(owner: object): IObservableSignal<TDelta>;
export interface IObservableSignal<TChange> extends IObservable<void, TChange> {
    trigger(tx: ITransaction | undefined, change: TChange): void;
}
/**
 * @deprecated Use `debouncedObservable2` instead.
 */
export declare function debouncedObservable<T>(observable: IObservable<T>, debounceMs: number, disposableStore: DisposableStore): IObservable<T | undefined>;
/**
 * Creates an observable that debounces the input observable.
 */
export declare function debouncedObservable2<T>(observable: IObservable<T>, debounceMs: number): IObservable<T>;
export declare function wasEventTriggeredRecently(event: Event<any>, timeoutMs: number, disposableStore: DisposableStore): IObservable<boolean>;
/**
 * This makes sure the observable is being observed and keeps its cache alive.
 */
export declare function keepObserved<T>(observable: IObservable<T>): IDisposable;
/**
 * This converts the given observable into an autorun.
 */
export declare function recomputeInitiallyAndOnChange<T>(observable: IObservable<T>, handleValue?: (value: T) => void): IDisposable;
export declare class KeepAliveObserver implements IObserver {
    private readonly _forceRecompute;
    private readonly _handleValue;
    private _counter;
    constructor(_forceRecompute: boolean, _handleValue: ((value: any) => void) | undefined);
    beginUpdate<T>(observable: IObservable<T, void>): void;
    endUpdate<T>(observable: IObservable<T, void>): void;
    handlePossibleChange<T>(observable: IObservable<T, unknown>): void;
    handleChange<T, TChange>(observable: IObservable<T, TChange>, change: TChange): void;
}
export declare function derivedObservableWithCache<T>(owner: DebugOwner, computeFn: (reader: IReader, lastValue: T | undefined) => T): IObservable<T>;
export declare function derivedObservableWithWritableCache<T>(owner: object, computeFn: (reader: IReader, lastValue: T | undefined) => T): IObservable<T> & {
    clearCache(transaction: ITransaction): void;
    setCache(newValue: T | undefined, tx: ITransaction | undefined): void;
};
/**
 * When the items array changes, referential equal items are not mapped again.
 */
export declare function mapObservableArrayCached<TIn, TOut, TKey = TIn>(owner: DebugOwner, items: IObservable<readonly TIn[]>, map: (input: TIn, store: DisposableStore) => TOut, keySelector?: (input: TIn) => TKey): IObservable<readonly TOut[]>;
export declare class ValueWithChangeEventFromObservable<T> implements IValueWithChangeEvent<T> {
    readonly observable: IObservable<T>;
    constructor(observable: IObservable<T>);
    get onDidChange(): Event<void>;
    get value(): T;
}
export declare function observableFromValueWithChangeEvent<T>(owner: DebugOwner, value: IValueWithChangeEvent<T>): IObservable<T>;
/**
 * Creates an observable that has the latest changed value of the given observables.
 * Initially (and when not observed), it has the value of the last observable.
 * When observed and any of the observables change, it has the value of the last changed observable.
 * If multiple observables change in the same transaction, the last observable wins.
 */
export declare function latestChangedValue<T extends IObservable<any>[]>(owner: DebugOwner, observables: T): IObservable<ReturnType<T[number]["get"]>>;
/**
 * Works like a derived.
 * However, if the value is not undefined, it is cached and will not be recomputed anymore.
 * In that case, the derived will unsubscribe from its dependencies.
 */
export declare function derivedConstOnceDefined<T>(owner: DebugOwner, fn: (reader: IReader) => T): IObservable<T | undefined>;
type RemoveUndefined<T> = T extends undefined ? never : T;
export declare function runOnChange<T, TChange>(observable: IObservable<T, TChange>, cb: (value: T, deltas: RemoveUndefined<TChange>[]) => void): IDisposable;
export declare function runOnChangeWithStore<T, TChange>(observable: IObservable<T, TChange>, cb: (value: T, deltas: RemoveUndefined<TChange>[], store: DisposableStore) => void): IDisposable;
export {};
