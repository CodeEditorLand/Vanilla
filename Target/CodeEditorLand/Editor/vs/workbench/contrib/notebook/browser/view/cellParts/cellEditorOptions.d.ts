import { type Event } from "../../../../../../base/common/event.js";
import type { URI } from "../../../../../../base/common/uri.js";
import type { IEditorOptions } from "../../../../../../editor/common/config/editorOptions.js";
import type { ITextModelUpdateOptions } from "../../../../../../editor/common/model.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { type NotebookCellInternalMetadata } from "../../../common/notebookCommon.js";
import type { IBaseCellEditorOptions, ICellViewModel } from "../../notebookBrowser.js";
import type { NotebookOptions } from "../../notebookOptions.js";
import type { CellViewModelStateChangeEvent } from "../../notebookViewEvents.js";
import { CellContentPart } from "../cellPart.js";
export declare class CellEditorOptions extends CellContentPart implements ITextModelUpdateOptions {
    private readonly base;
    readonly notebookOptions: NotebookOptions;
    readonly configurationService: IConfigurationService;
    private _lineNumbers;
    private _tabSize?;
    private _indentSize?;
    private _insertSpaces?;
    set tabSize(value: number | undefined);
    get tabSize(): number | undefined;
    set indentSize(value: number | "tabSize" | undefined);
    get indentSize(): number | "tabSize" | undefined;
    set insertSpaces(value: boolean | undefined);
    get insertSpaces(): boolean | undefined;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    private _value;
    constructor(base: IBaseCellEditorOptions, notebookOptions: NotebookOptions, configurationService: IConfigurationService);
    updateState(element: ICellViewModel, e: CellViewModelStateChangeEvent): void;
    private _recomputeOptions;
    private _computeEditorOptions;
    getUpdatedValue(internalMetadata: NotebookCellInternalMetadata, cellUri: URI): IEditorOptions;
    getValue(internalMetadata: NotebookCellInternalMetadata, cellUri: URI): IEditorOptions;
    getDefaultValue(): IEditorOptions;
    setLineNumbers(lineNumbers: "on" | "off" | "inherit"): void;
}
