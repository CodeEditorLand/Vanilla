export interface IDebugNameData {
    /**
     * The owner object of an observable.
     * Used for debugging only, such as computing a name for the observable by iterating over the fields of the owner.
     */
    readonly owner?: DebugOwner | undefined;
    /**
     * A string or function that returns a string that represents the name of the observable.
     * Used for debugging only.
     */
    readonly debugName?: DebugNameSource | undefined;
    /**
     * A function that points to the defining function of the object.
     * Used for debugging only.
     */
    readonly debugReferenceFn?: Function | undefined;
}
export declare class DebugNameData {
    readonly owner: DebugOwner | undefined;
    readonly debugNameSource: DebugNameSource | undefined;
    readonly referenceFn: Function | undefined;
    constructor(owner: DebugOwner | undefined, debugNameSource: DebugNameSource | undefined, referenceFn: Function | undefined);
    getDebugName(target: object): string | undefined;
}
/**
 * The owning object of an observable.
 * Is only used for debugging purposes, such as computing a name for the observable by iterating over the fields of the owner.
 */
export type DebugOwner = object | undefined;
export type DebugNameSource = string | (() => string | undefined);
export declare function getDebugName(target: object, data: DebugNameData): string | undefined;
export declare function getFunctionName(fn: Function): string | undefined;
