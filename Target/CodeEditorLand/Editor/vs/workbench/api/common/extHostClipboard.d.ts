import type * as vscode from "vscode";
import { type IMainContext } from "./extHost.protocol.js";
export declare class ExtHostClipboard {
    readonly value: vscode.Clipboard;
    constructor(mainContext: IMainContext);
}
