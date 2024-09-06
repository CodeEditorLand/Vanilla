import { URI } from "vs/base/common/uri";
import { IFileDialogService } from "vs/platform/dialogs/common/dialogs";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
import { MainThreadDiaglogsShape, MainThreadDialogOpenOptions, MainThreadDialogSaveOptions } from "../common/extHost.protocol";
export declare class MainThreadDialogs implements MainThreadDiaglogsShape {
    private readonly _fileDialogService;
    constructor(context: IExtHostContext, _fileDialogService: IFileDialogService);
    dispose(): void;
    $showOpenDialog(options?: MainThreadDialogOpenOptions): Promise<URI[] | undefined>;
    $showSaveDialog(options?: MainThreadDialogSaveOptions): Promise<URI | undefined>;
    private static _convertOpenOptions;
    private static _convertSaveOptions;
}
