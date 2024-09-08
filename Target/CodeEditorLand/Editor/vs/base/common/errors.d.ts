export interface ErrorListenerCallback {
    (error: any): void;
}
export interface ErrorListenerUnbind {
    (): void;
}
export declare class ErrorHandler {
    private unexpectedErrorHandler;
    private listeners;
    constructor();
    addListener(listener: ErrorListenerCallback): ErrorListenerUnbind;
    private emit;
    private _removeListener;
    setUnexpectedErrorHandler(newUnexpectedErrorHandler: (e: any) => void): void;
    getUnexpectedErrorHandler(): (e: any) => void;
    onUnexpectedError(e: any): void;
    onUnexpectedExternalError(e: any): void;
}
export declare const errorHandler: ErrorHandler;
/** @skipMangle */
export declare function setUnexpectedErrorHandler(newUnexpectedErrorHandler: (e: any) => void): void;
/**
 * Returns if the error is a SIGPIPE error. SIGPIPE errors should generally be
 * logged at most once, to avoid a loop.
 *
 * @see https://github.com/microsoft/vscode-remote-release/issues/6481
 */
export declare function isSigPipeError(e: unknown): e is Error;
/**
 * This function should only be called with errors that indicate a bug in the product.
 * E.g. buggy extensions/invalid user-input/network issues should not be able to trigger this code path.
 * If they are, this indicates there is also a bug in the product.
 */
export declare function onBugIndicatingError(e: any): undefined;
export declare function onUnexpectedError(e: any): undefined;
export declare function onUnexpectedExternalError(e: any): undefined;
export interface SerializedError {
    readonly $isError: true;
    readonly name: string;
    readonly message: string;
    readonly stack: string;
    readonly noTelemetry: boolean;
}
export declare function transformErrorForSerialization(error: Error): SerializedError;
export declare function transformErrorForSerialization(error: any): any;
export declare function transformErrorFromSerialization(data: SerializedError): Error;
export interface V8CallSite {
    getThis(): unknown;
    getTypeName(): string | null;
    getFunction(): Function | undefined;
    getFunctionName(): string | null;
    getMethodName(): string | null;
    getFileName(): string | null;
    getLineNumber(): number | null;
    getColumnNumber(): number | null;
    getEvalOrigin(): string | undefined;
    isToplevel(): boolean;
    isEval(): boolean;
    isNative(): boolean;
    isConstructor(): boolean;
    toString(): string;
}
/**
 * Checks if the given error is a promise in canceled state
 */
export declare function isCancellationError(error: any): boolean;
export declare class CancellationError extends Error {
    constructor();
}
/**
 * @deprecated use {@link CancellationError `new CancellationError()`} instead
 */
export declare function canceled(): Error;
export declare function illegalArgument(name?: string): Error;
export declare function illegalState(name?: string): Error;
export declare class ReadonlyError extends TypeError {
    constructor(name?: string);
}
export declare function getErrorMessage(err: any): string;
export declare class NotImplementedError extends Error {
    constructor(message?: string);
}
export declare class NotSupportedError extends Error {
    constructor(message?: string);
}
export declare class ExpectedError extends Error {
    readonly isExpected = true;
}
/**
 * Error that when thrown won't be logged in telemetry as an unhandled error.
 */
export declare class ErrorNoTelemetry extends Error {
    readonly name: string;
    constructor(msg?: string);
    static fromError(err: Error): ErrorNoTelemetry;
    static isErrorNoTelemetry(err: Error): err is ErrorNoTelemetry;
}
/**
 * This error indicates a bug.
 * Do not throw this for invalid user input.
 * Only catch this error to recover gracefully from bugs.
 */
export declare class BugIndicatingError extends Error {
    constructor(message?: string);
}
