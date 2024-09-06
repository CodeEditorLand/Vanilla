import { Table } from "vs/base/browser/ui/table/tableWidget";
import { Disposable } from "vs/base/common/lifecycle";
import { IQuickInputService } from "vs/platform/quickinput/common/quickInput";
export declare class TableColumnResizeQuickPick extends Disposable {
    private readonly _table;
    private readonly _quickInputService;
    constructor(_table: Table<any>, _quickInputService: IQuickInputService);
    show(): Promise<void>;
    private _validateColumnResizeValue;
}
