import type * as vscode from "vscode";
import { type IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { type ExtHostCommentsShape, type IMainContext } from "./extHost.protocol.js";
import type { ExtHostCommands } from "./extHostCommands.js";
import type { ExtHostDocuments } from "./extHostDocuments.js";
interface ExtHostComments {
    createCommentController(extension: IExtensionDescription, id: string, label: string): vscode.CommentController;
}
export declare function createExtHostComments(mainContext: IMainContext, commands: ExtHostCommands, documents: ExtHostDocuments): ExtHostCommentsShape & ExtHostComments;
export {};
