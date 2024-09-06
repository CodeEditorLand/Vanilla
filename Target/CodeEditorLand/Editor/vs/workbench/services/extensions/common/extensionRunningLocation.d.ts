export declare class LocalProcessRunningLocation {
    readonly affinity: number;
    readonly kind: any;
    constructor(affinity: number);
    equals(other: ExtensionRunningLocation): boolean;
    asString(): string;
}
export declare class LocalWebWorkerRunningLocation {
    readonly affinity: number;
    readonly kind: any;
    constructor(affinity: number);
    equals(other: ExtensionRunningLocation): boolean;
    asString(): string;
}
export declare class RemoteRunningLocation {
    readonly kind: any;
    readonly affinity = 0;
    equals(other: ExtensionRunningLocation): boolean;
    asString(): string;
}
export type ExtensionRunningLocation = LocalProcessRunningLocation | LocalWebWorkerRunningLocation | RemoteRunningLocation;
