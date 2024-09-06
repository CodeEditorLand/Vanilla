import { IDisposable } from "vs/base/common/lifecycle";
export interface ActionSet<T> extends IDisposable {
    readonly validActions: readonly T[];
    readonly allActions: readonly T[];
    readonly hasAutoFix: boolean;
    readonly hasAIFix: boolean;
    readonly allAIFixes: boolean;
}
