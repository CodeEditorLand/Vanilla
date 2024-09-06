export declare const isESM = false;
export declare const canASAR = true;
export declare const enum LoaderEventType {
    LoaderAvailable = 1,
    BeginLoadingScript = 10,
    EndLoadingScriptOK = 11,
    EndLoadingScriptError = 12,
    BeginInvokeFactory = 21,
    EndInvokeFactory = 22,
    NodeBeginEvaluatingScript = 31,
    NodeEndEvaluatingScript = 32,
    NodeBeginNativeRequire = 33,
    NodeEndNativeRequire = 34,
    CachedDataFound = 60,
    CachedDataMissed = 61,
    CachedDataRejected = 62,
    CachedDataCreated = 63
}
export declare abstract class LoaderStats {
    abstract get amdLoad(): [string, number][];
    abstract get amdInvoke(): [string, number][];
    abstract get nodeRequire(): [string, number][];
    abstract get nodeEval(): [string, number][];
    abstract get nodeRequireTotal(): number;
    static get(): LoaderStats;
    static toMarkdownTable(header: string[], rows: Array<Array<{
        toString(): string;
    } | undefined>>): string;
}
