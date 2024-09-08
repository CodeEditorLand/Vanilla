import type { Event } from "../../../../base/common/event.js";
import type { IDisposable } from "../../../../base/common/lifecycle.js";
import type { URI } from "../../../../base/common/uri.js";
import type { LanguageSelector } from "../../../../editor/common/languageSelector.js";
export declare const IQuickDiffService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IQuickDiffService>;
export interface QuickDiffProvider {
    label: string;
    rootUri: URI | undefined;
    selector?: LanguageSelector;
    isSCM: boolean;
    getOriginalResource(uri: URI): Promise<URI | null>;
}
export interface QuickDiff {
    label: string;
    originalResource: URI;
    isSCM: boolean;
}
export interface IQuickDiffService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeQuickDiffProviders: Event<void>;
    addQuickDiffProvider(quickDiff: QuickDiffProvider): IDisposable;
    getQuickDiffs(uri: URI, language?: string, isSynchronized?: boolean): Promise<QuickDiff[]>;
}
