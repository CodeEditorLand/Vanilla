import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { ILanguageConfigurationService } from "vs/editor/common/languages/languageConfigurationRegistry";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { StickyElement, StickyRange } from "vs/editor/contrib/stickyScroll/browser/stickyScrollElement";
export declare class StickyLineCandidate {
    readonly startLineNumber: number;
    readonly endLineNumber: number;
    readonly nestingDepth: number;
    constructor(startLineNumber: number, endLineNumber: number, nestingDepth: number);
}
export interface IStickyLineCandidateProvider {
    dispose(): void;
    getVersionId(): number | undefined;
    update(): Promise<void>;
    getCandidateStickyLinesIntersecting(range: StickyRange): StickyLineCandidate[];
    onDidChangeStickyScroll: Event<void>;
}
export declare class StickyLineCandidateProvider extends Disposable implements IStickyLineCandidateProvider {
    private readonly _languageFeaturesService;
    private readonly _languageConfigurationService;
    static readonly ID = "store.contrib.stickyScrollController";
    private readonly _onDidChangeStickyScroll;
    readonly onDidChangeStickyScroll: any;
    private readonly _editor;
    private readonly _updateSoon;
    private readonly _sessionStore;
    private _model;
    private _cts;
    private _stickyModelProvider;
    constructor(editor: ICodeEditor, _languageFeaturesService: ILanguageFeaturesService, _languageConfigurationService: ILanguageConfigurationService);
    private readConfiguration;
    getVersionId(): number | undefined;
    private updateStickyModelProvider;
    update(): Promise<void>;
    private updateStickyModel;
    private updateIndex;
    getCandidateStickyLinesIntersectingFromStickyModel(range: StickyRange, outlineModel: StickyElement, result: StickyLineCandidate[], depth: number, lastStartLineNumber: number): void;
    getCandidateStickyLinesIntersecting(range: StickyRange): StickyLineCandidate[];
}
