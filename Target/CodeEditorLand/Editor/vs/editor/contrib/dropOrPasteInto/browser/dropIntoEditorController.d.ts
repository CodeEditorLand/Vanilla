import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { ITreeViewsDnDService } from "vs/editor/common/services/treeViewsDndService";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
export declare const defaultProviderConfig = "editor.experimental.dropIntoEditor.defaultProvider";
export declare const changeDropTypeCommandId = "editor.changeDropType";
export declare const dropWidgetVisibleCtx: any;
export declare class DropIntoEditorController extends Disposable implements IEditorContribution {
    private readonly _configService;
    private readonly _languageFeaturesService;
    private readonly _treeViewsDragAndDropService;
    static readonly ID = "editor.contrib.dropIntoEditorController";
    static get(editor: ICodeEditor): DropIntoEditorController | null;
    private _currentOperation?;
    private readonly _dropProgressManager;
    private readonly _postDropWidgetManager;
    private readonly treeItemsTransfer;
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService, _configService: IConfigurationService, _languageFeaturesService: ILanguageFeaturesService, _treeViewsDragAndDropService: ITreeViewsDnDService);
    clearWidgets(): void;
    changeDropType(): void;
    private onDropIntoEditor;
    private getDropEdits;
    private getInitialActiveEditIndex;
    private extractDataTransferData;
}
