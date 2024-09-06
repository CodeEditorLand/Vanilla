import { IAction } from "vs/base/common/actions";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from "vs/editor/browser/editorBrowser";
import { IRange } from "vs/editor/common/core/range";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { AbstractFloatingClickMenu, FloatingClickWidget } from "vs/platform/actions/browser/floatingMenu";
import { IMenuService } from "vs/platform/actions/common/actions";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
export interface IRangeHighlightDecoration {
    resource: URI;
    range: IRange;
    isWholeLine?: boolean;
}
export declare class RangeHighlightDecorations extends Disposable {
    private readonly editorService;
    private readonly _onHighlightRemoved;
    readonly onHighlightRemoved: any;
    private rangeHighlightDecorationId;
    private editor;
    private readonly editorDisposables;
    constructor(editorService: IEditorService);
    removeHighlightRange(): void;
    highlightRange(range: IRangeHighlightDecoration, editor?: any): void;
    private doHighlightRange;
    private getEditor;
    private setEditor;
    private static readonly _WHOLE_LINE_RANGE_HIGHLIGHT;
    private static readonly _RANGE_HIGHLIGHT;
    private createRangeHighlightDecoration;
    dispose(): void;
}
export declare class FloatingEditorClickWidget extends FloatingClickWidget implements IOverlayWidget {
    private editor;
    constructor(editor: ICodeEditor, label: string, keyBindingAction: string | null, keybindingService: IKeybindingService);
    getId(): string;
    getPosition(): IOverlayWidgetPosition;
    render(): void;
    dispose(): void;
}
export declare class FloatingEditorClickMenu extends AbstractFloatingClickMenu implements IEditorContribution {
    private readonly editor;
    private readonly instantiationService;
    static readonly ID = "editor.contrib.floatingClickMenu";
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService, menuService: IMenuService, contextKeyService: IContextKeyService);
    protected createWidget(action: IAction): FloatingClickWidget;
    protected isVisible(): any;
    protected getActionArg(): unknown;
}
