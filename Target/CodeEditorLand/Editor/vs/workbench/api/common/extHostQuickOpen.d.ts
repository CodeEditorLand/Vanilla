import type { InputBox, InputBoxOptions, QuickPick, QuickPickItem, QuickPickOptions, WorkspaceFolder, WorkspaceFolderPickOptions } from "vscode";
import { CancellationToken } from "../../../base/common/cancellation.js";
import type { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { type ExtHostQuickOpenShape, type IMainContext } from "./extHost.protocol.js";
import type { ExtHostCommands } from "./extHostCommands.js";
import type { IExtHostWorkspaceProvider } from "./extHostWorkspace.js";
export type Item = string | QuickPickItem;
export interface ExtHostQuickOpen {
    showQuickPick(extension: IExtensionDescription, itemsOrItemsPromise: QuickPickItem[] | Promise<QuickPickItem[]>, options: QuickPickOptions & {
        canPickMany: true;
    }, token?: CancellationToken): Promise<QuickPickItem[] | undefined>;
    showQuickPick(extension: IExtensionDescription, itemsOrItemsPromise: string[] | Promise<string[]>, options?: QuickPickOptions, token?: CancellationToken): Promise<string | undefined>;
    showQuickPick(extension: IExtensionDescription, itemsOrItemsPromise: QuickPickItem[] | Promise<QuickPickItem[]>, options?: QuickPickOptions, token?: CancellationToken): Promise<QuickPickItem | undefined>;
    showQuickPick(extension: IExtensionDescription, itemsOrItemsPromise: Item[] | Promise<Item[]>, options?: QuickPickOptions, token?: CancellationToken): Promise<Item | Item[] | undefined>;
    showInput(options?: InputBoxOptions, token?: CancellationToken): Promise<string | undefined>;
    showWorkspaceFolderPick(options?: WorkspaceFolderPickOptions, token?: CancellationToken): Promise<WorkspaceFolder | undefined>;
    createQuickPick<T extends QuickPickItem>(extension: IExtensionDescription): QuickPick<T>;
    createInputBox(extension: IExtensionDescription): InputBox;
}
export declare function createExtHostQuickOpen(mainContext: IMainContext, workspace: IExtHostWorkspaceProvider, commands: ExtHostCommands): ExtHostQuickOpenShape & ExtHostQuickOpen;
