export declare class Lazy<T> {
    private readonly executor;
    private _didRun;
    private _value?;
    private _error;
    constructor(executor: () => T);
    /**
     * True if the lazy value has been resolved.
     */
    get hasValue(): boolean;
    /**
     * Get the wrapped value.
     *
     * This will force evaluation of the lazy value if it has not been resolved yet. Lazy values are only
     * resolved once. `getValue` will re-throw exceptions that are hit while resolving the value
     */
    get value(): T;
    /**
     * Get the wrapped value without forcing evaluation.
     */
    get rawValue(): T | undefined;
}
