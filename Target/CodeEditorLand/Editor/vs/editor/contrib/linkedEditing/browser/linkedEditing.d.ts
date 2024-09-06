import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { EditorAction, ServicesAccessor } from "vs/editor/browser/editorExtensions";
import { IPosition } from "vs/editor/common/core/position";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { ILanguageConfigurationService } from "vs/editor/common/languages/languageConfigurationRegistry";
import { ILanguageFeatureDebounceService } from "vs/editor/common/services/languageFeatureDebounce";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import "vs/css!./linkedEditing";
export declare const CONTEXT_ONTYPE_RENAME_INPUT_VISIBLE: any;
export declare class LinkedEditingContribution extends Disposable implements IEditorContribution {
    private readonly languageConfigurationService;
    static readonly ID = "editor.contrib.linkedEditing";
    private static readonly DECORATION;
    static get(editor: ICodeEditor): LinkedEditingContribution | null;
    private _debounceDuration;
    private readonly _editor;
    private readonly _providers;
    private _enabled;
    private readonly _visibleContextKey;
    private readonly _debounceInformation;
    private _rangeUpdateTriggerPromise;
    private _rangeSyncTriggerPromise;
    private _currentRequestCts;
    private _currentRequestPosition;
    private _currentRequestModelVersion;
    private _currentDecorations;
    private _syncRangesToken;
    private _languageWordPattern;
    private _currentWordPattern;
    private _ignoreChangeEvent;
    private readonly _localToDispose;
    constructor(editor: ICodeEditor, contextKeyService: IContextKeyService, languageFeaturesService: ILanguageFeaturesService, languageConfigurationService: ILanguageConfigurationService, languageFeatureDebounceService: ILanguageFeatureDebounceService);
    private reinitialize;
    private _syncRanges;
    dispose(): void;
    clearRanges(): void;
    get currentUpdateTriggerPromise(): Promise<any>;
    get currentSyncTriggerPromise(): Promise<any>;
    updateRanges(force?: boolean): Promise<void>;
    setDebounceDuration(timeInMS: number): void;
}
export declare class LinkedEditingAction extends EditorAction {
    constructor();
    runCommand(accessor: ServicesAccessor, args: [URI, IPosition]): void | Promise<void>;
    run(_accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
export declare const editorLinkedEditingBackground: any;