import type { IHistoryNavigationWidget } from "../../../base/browser/history.js";
import type { IContextViewProvider } from "../../../base/browser/ui/contextview/contextview.js";
import { FindInput, type IFindInputOptions } from "../../../base/browser/ui/findinput/findInput.js";
import { type IReplaceInputOptions, ReplaceInput } from "../../../base/browser/ui/findinput/replaceInput.js";
import { HistoryInputBox, type IHistoryInputOptions } from "../../../base/browser/ui/inputbox/inputBox.js";
import { type IDisposable } from "../../../base/common/lifecycle.js";
import { type IContextKey, IContextKeyService, RawContextKey } from "../../contextkey/common/contextkey.js";
export declare const historyNavigationVisible: RawContextKey<boolean>;
export interface IHistoryNavigationContext extends IDisposable {
    historyNavigationForwardsEnablement: IContextKey<boolean>;
    historyNavigationBackwardsEnablement: IContextKey<boolean>;
}
export declare function registerAndCreateHistoryNavigationContext(scopedContextKeyService: IContextKeyService, widget: IHistoryNavigationWidget): IHistoryNavigationContext;
export declare class ContextScopedHistoryInputBox extends HistoryInputBox {
    constructor(container: HTMLElement, contextViewProvider: IContextViewProvider | undefined, options: IHistoryInputOptions, contextKeyService: IContextKeyService);
}
export declare class ContextScopedFindInput extends FindInput {
    constructor(container: HTMLElement | null, contextViewProvider: IContextViewProvider, options: IFindInputOptions, contextKeyService: IContextKeyService);
}
export declare class ContextScopedReplaceInput extends ReplaceInput {
    constructor(container: HTMLElement | null, contextViewProvider: IContextViewProvider | undefined, options: IReplaceInputOptions, contextKeyService: IContextKeyService, showReplaceOptions?: boolean);
}
