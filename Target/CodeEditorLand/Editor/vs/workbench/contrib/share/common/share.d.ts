import type { CancellationToken } from "../../../../base/common/cancellation.js";
import type { IDisposable } from "../../../../base/common/lifecycle.js";
import type { URI } from "../../../../base/common/uri.js";
import type { Selection } from "../../../../editor/common/core/selection.js";
import type { LanguageSelector } from "../../../../editor/common/languageSelector.js";
import type { ISubmenuItem } from "../../../../platform/actions/common/actions.js";
export interface IShareableItem {
    resourceUri: URI;
    selection?: Selection;
}
export interface IShareProvider {
    readonly id: string;
    readonly label: string;
    readonly priority: number;
    readonly selector: LanguageSelector;
    prepareShare?(item: IShareableItem, token: CancellationToken): Thenable<boolean | undefined>;
    provideShare(item: IShareableItem, token: CancellationToken): Thenable<URI | string | undefined>;
}
export declare const IShareService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IShareService>;
export interface IShareService {
    _serviceBrand: undefined;
    registerShareProvider(provider: IShareProvider): IDisposable;
    getShareActions(): ISubmenuItem[];
    provideShare(item: IShareableItem, token: CancellationToken): Thenable<URI | string | undefined>;
}
