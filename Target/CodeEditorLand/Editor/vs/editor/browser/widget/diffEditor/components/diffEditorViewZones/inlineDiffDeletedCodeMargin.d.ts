import { Disposable } from "vs/base/common/lifecycle";
import { CodeEditorWidget } from "vs/editor/browser/widget/codeEditor/codeEditorWidget";
import { DiffEditorWidget } from "vs/editor/browser/widget/diffEditor/diffEditorWidget";
import { DetailedLineRangeMapping } from "vs/editor/common/diff/rangeMapping";
import { ITextModel } from "vs/editor/common/model";
import { IClipboardService } from "vs/platform/clipboard/common/clipboardService";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
export declare class InlineDiffDeletedCodeMargin extends Disposable {
    private readonly _getViewZoneId;
    private readonly _marginDomNode;
    private readonly _modifiedEditor;
    private readonly _diff;
    private readonly _editor;
    private readonly _viewLineCounts;
    private readonly _originalTextModel;
    private readonly _contextMenuService;
    private readonly _clipboardService;
    private readonly _diffActions;
    private _visibility;
    get visibility(): boolean;
    set visibility(_visibility: boolean);
    constructor(_getViewZoneId: () => string, _marginDomNode: HTMLElement, _modifiedEditor: CodeEditorWidget, _diff: DetailedLineRangeMapping, _editor: DiffEditorWidget, _viewLineCounts: number[], _originalTextModel: ITextModel, _contextMenuService: IContextMenuService, _clipboardService: IClipboardService);
    private _updateLightBulbPosition;
}
