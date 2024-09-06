import type * as vscode from "vscode";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Event } from "../../../base/common/event.js";
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { FileOperation } from "../../../platform/files/common/files.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { ExtHostFileSystemEventServiceShape, FileSystemEvents, IMainContext, IWillRunFileOperationParticipation, SourceTargetPair } from "./extHost.protocol.js";
import { ExtHostDocumentsAndEditors } from "./extHostDocumentsAndEditors.js";
import { IExtHostWorkspace } from "./extHostWorkspace.js";
export interface FileSystemWatcherCreateOptions {
    readonly correlate: boolean;
    readonly ignoreCreateEvents?: boolean;
    readonly ignoreChangeEvents?: boolean;
    readonly ignoreDeleteEvents?: boolean;
    readonly excludes?: string[];
}
export declare class ExtHostFileSystemEventService implements ExtHostFileSystemEventServiceShape {
    private readonly _mainContext;
    private readonly _logService;
    private readonly _extHostDocumentsAndEditors;
    private readonly _onFileSystemEvent;
    private readonly _onDidRenameFile;
    private readonly _onDidCreateFile;
    private readonly _onDidDeleteFile;
    private readonly _onWillRenameFile;
    private readonly _onWillCreateFile;
    private readonly _onWillDeleteFile;
    readonly onDidRenameFile: Event<vscode.FileRenameEvent>;
    readonly onDidCreateFile: Event<vscode.FileCreateEvent>;
    readonly onDidDeleteFile: Event<vscode.FileDeleteEvent>;
    constructor(_mainContext: IMainContext, _logService: ILogService, _extHostDocumentsAndEditors: ExtHostDocumentsAndEditors);
    createFileSystemWatcher(workspace: IExtHostWorkspace, extension: IExtensionDescription, globPattern: vscode.GlobPattern, options?: FileSystemWatcherCreateOptions): vscode.FileSystemWatcher;
    $onFileEvent(events: FileSystemEvents): void;
    $onDidRunFileOperation(operation: FileOperation, files: SourceTargetPair[]): void;
    getOnWillRenameFileEvent(extension: IExtensionDescription): Event<vscode.FileWillRenameEvent>;
    getOnWillCreateFileEvent(extension: IExtensionDescription): Event<vscode.FileWillCreateEvent>;
    getOnWillDeleteFileEvent(extension: IExtensionDescription): Event<vscode.FileWillDeleteEvent>;
    private _createWillExecuteEvent;
    $onWillRunFileOperation(operation: FileOperation, files: SourceTargetPair[], timeout: number, token: CancellationToken): Promise<IWillRunFileOperationParticipation | undefined>;
    private _fireWillEvent;
}
