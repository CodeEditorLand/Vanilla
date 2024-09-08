import type * as vscode from "vscode";
import { URI } from "../../../base/common/uri.js";
import type { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { type IMainContext } from "./extHost.protocol.js";
export declare class ExtHostDialogs {
    private readonly _proxy;
    constructor(mainContext: IMainContext);
    showOpenDialog(extension: IExtensionDescription, options?: vscode.OpenDialogOptions): Promise<URI[] | undefined>;
    showSaveDialog(options?: vscode.SaveDialogOptions): Promise<URI | undefined>;
}
