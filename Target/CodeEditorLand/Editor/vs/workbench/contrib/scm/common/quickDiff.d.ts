import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { LanguageSelector } from "vs/editor/common/languageSelector";
export declare const IQuickDiffService: any;
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
