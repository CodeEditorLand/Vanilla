import "vs/css!./editorDictation";
import { IDimension } from "vs/base/browser/dom";
import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor, IContentWidget, IContentWidgetPosition } from "vs/editor/browser/editorBrowser";
import { EditorAction2 } from "vs/editor/browser/editorExtensions";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ISpeechService } from "vs/workbench/contrib/speech/common/speechService";
export declare class EditorDictationStartAction extends EditorAction2 {
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class EditorDictationStopAction extends EditorAction2 {
    static readonly ID = "workbench.action.editorDictation.stop";
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class DictationWidget extends Disposable implements IContentWidget {
    private readonly editor;
    readonly suppressMouseDown = true;
    readonly allowEditorOverflow = true;
    private readonly domNode;
    constructor(editor: ICodeEditor, keybindingService: IKeybindingService);
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IContentWidgetPosition | null;
    beforeRender(): IDimension | null;
    show(): void;
    layout(): void;
    active(): void;
    hide(): void;
}
export declare class EditorDictation extends Disposable implements IEditorContribution {
    private readonly editor;
    private readonly speechService;
    private readonly contextKeyService;
    private readonly keybindingService;
    static readonly ID = "editorDictation";
    static get(editor: ICodeEditor): EditorDictation | null;
    private readonly widget;
    private readonly editorDictationInProgress;
    private readonly sessionDisposables;
    constructor(editor: ICodeEditor, speechService: ISpeechService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService);
    start(): Promise<void>;
    stop(): void;
}
