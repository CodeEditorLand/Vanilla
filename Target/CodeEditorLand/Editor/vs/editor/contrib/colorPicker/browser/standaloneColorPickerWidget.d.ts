import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor, IContentWidget, IContentWidgetPosition } from "vs/editor/browser/editorBrowser";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IContextKey, IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import "vs/css!./colorPicker";
import { IEditorWorkerService } from "vs/editor/common/services/editorWorker";
export declare class StandaloneColorPickerController extends Disposable implements IEditorContribution {
    private readonly _editor;
    private readonly _instantiationService;
    static ID: string;
    private _standaloneColorPickerWidget;
    private _standaloneColorPickerVisible;
    private _standaloneColorPickerFocused;
    constructor(_editor: ICodeEditor, _contextKeyService: IContextKeyService, _instantiationService: IInstantiationService);
    showOrFocus(): void;
    hide(): void;
    insertColor(): void;
    static get(editor: ICodeEditor): any;
}
export declare class StandaloneColorPickerWidget extends Disposable implements IContentWidget {
    private readonly _editor;
    private readonly _standaloneColorPickerVisible;
    private readonly _standaloneColorPickerFocused;
    private readonly _keybindingService;
    private readonly _languageFeaturesService;
    private readonly _editorWorkerService;
    static readonly ID = "editor.contrib.standaloneColorPickerWidget";
    readonly allowEditorOverflow = true;
    private readonly _position;
    private readonly _standaloneColorPickerParticipant;
    private _body;
    private _colorHover;
    private _selectionSetInEditor;
    private readonly _onResult;
    readonly onResult: any;
    constructor(_editor: ICodeEditor, _standaloneColorPickerVisible: IContextKey<boolean>, _standaloneColorPickerFocused: IContextKey<boolean>, _instantiationService: IInstantiationService, _keybindingService: IKeybindingService, _languageFeaturesService: ILanguageFeaturesService, _editorWorkerService: IEditorWorkerService);
    updateEditor(): void;
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IContentWidgetPosition | null;
    hide(): void;
    focus(): void;
    private _start;
    private _computeAsync;
    private _render;
}
