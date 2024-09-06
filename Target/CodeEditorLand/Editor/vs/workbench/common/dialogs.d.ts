import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IDialogArgs, IDialogResult } from "vs/platform/dialogs/common/dialogs";
export interface IDialogViewItem {
    readonly args: IDialogArgs;
    close(result?: IDialogResult | Error): void;
}
export interface IDialogHandle {
    readonly item: IDialogViewItem;
    readonly result: Promise<IDialogResult | undefined>;
}
export interface IDialogsModel {
    readonly onWillShowDialog: Event<void>;
    readonly onDidShowDialog: Event<void>;
    readonly dialogs: IDialogViewItem[];
    show(dialog: IDialogArgs): IDialogHandle;
}
export declare class DialogsModel extends Disposable implements IDialogsModel {
    readonly dialogs: IDialogViewItem[];
    private readonly _onWillShowDialog;
    readonly onWillShowDialog: any;
    private readonly _onDidShowDialog;
    readonly onDidShowDialog: any;
    show(dialog: IDialogArgs): IDialogHandle;
}
