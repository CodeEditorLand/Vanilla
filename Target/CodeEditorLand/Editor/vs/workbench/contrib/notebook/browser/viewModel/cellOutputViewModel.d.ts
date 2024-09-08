import { Disposable } from "../../../../../base/common/lifecycle.js";
import type { NotebookTextModel } from "../../common/model/notebookTextModel.js";
import { type ICellOutput, type IOrderedMimeType } from "../../common/notebookCommon.js";
import type { INotebookService } from "../../common/notebookService.js";
import type { ICellOutputViewModel, IGenericCellViewModel } from "../notebookBrowser.js";
export declare class CellOutputViewModel extends Disposable implements ICellOutputViewModel {
    readonly cellViewModel: IGenericCellViewModel;
    private readonly _outputRawData;
    private readonly _notebookService;
    private _onDidResetRendererEmitter;
    readonly onDidResetRenderer: import("../../../../../base/common/event.js").Event<void>;
    private alwaysShow;
    visible: import("../../../../../base/common/observable.js").ISettableObservable<boolean, void>;
    setVisible(visible?: boolean, force?: boolean): void;
    outputHandle: number;
    get model(): ICellOutput;
    private _pickedMimeType;
    get pickedMimeType(): IOrderedMimeType | undefined;
    set pickedMimeType(value: IOrderedMimeType | undefined);
    constructor(cellViewModel: IGenericCellViewModel, _outputRawData: ICellOutput, _notebookService: INotebookService);
    hasMultiMimeType(): boolean;
    resolveMimeTypes(textModel: NotebookTextModel, kernelProvides: readonly string[] | undefined): [readonly IOrderedMimeType[], number];
    resetRenderer(): void;
    toRawJSON(): {
        outputs: import("../../common/notebookCommon.js").IOutputItemDto[];
    };
}
