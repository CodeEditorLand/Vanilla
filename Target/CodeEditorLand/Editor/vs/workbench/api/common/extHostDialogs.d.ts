import { URI } from "vs/base/common/uri";
import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { IMainContext } from "vs/workbench/api/common/extHost.protocol";
import type * as vscode from "vscode";
export declare class ExtHostDialogs {
    private readonly _proxy;
    constructor(mainContext: IMainContext);
    showOpenDialog(extension: IExtensionDescription, options?: vscode.OpenDialogOptions): Promise<URI[] | undefined>;
    showSaveDialog(options?: vscode.SaveDialogOptions): Promise<URI | undefined>;
}
