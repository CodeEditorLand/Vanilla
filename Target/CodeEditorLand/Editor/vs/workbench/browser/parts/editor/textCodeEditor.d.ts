import type { Dimension } from "../../../../base/browser/dom.js";
import type { URI } from "../../../../base/common/uri.js";
import type { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { type ICodeEditorWidgetOptions } from "../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import type { IEditorOptions as ICodeEditorOptions } from "../../../../editor/common/config/editorOptions.js";
import { type IEditorViewState } from "../../../../editor/common/editorCommon.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import type { ITextEditorOptions } from "../../../../platform/editor/common/editor.js";
import type { ITextEditorPane } from "../../../common/editor.js";
import { AbstractTextEditor } from "./textEditor.js";
/**
 * A text editor using the code editor widget.
 */
export declare abstract class AbstractTextCodeEditor<T extends IEditorViewState> extends AbstractTextEditor<T> implements ITextEditorPane {
    protected editorControl: ICodeEditor | undefined;
    get scopedContextKeyService(): IContextKeyService | undefined;
    getTitle(): string;
    protected createEditorControl(parent: HTMLElement, initialOptions: ICodeEditorOptions): void;
    protected getCodeEditorWidgetOptions(): ICodeEditorWidgetOptions;
    protected updateEditorControlOptions(options: ICodeEditorOptions): void;
    protected getMainControl(): ICodeEditor | undefined;
    getControl(): ICodeEditor | undefined;
    protected computeEditorViewState(resource: URI): T | undefined;
    setOptions(options: ITextEditorOptions | undefined): void;
    focus(): void;
    hasFocus(): boolean;
    protected setEditorVisible(visible: boolean): void;
    layout(dimension: Dimension): void;
}
