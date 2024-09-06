import { VSBufferReadableStream } from "vs/base/common/buffer";
import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { ILogService } from "vs/platform/log/common/log";
import { ISaveOptions } from "vs/workbench/common/editor";
import { IFileWorkingCopy, IFileWorkingCopyModel, IFileWorkingCopyModelFactory } from "vs/workbench/services/workingCopy/common/fileWorkingCopy";
import { IWorkingCopyBackup } from "vs/workbench/services/workingCopy/common/workingCopy";
import { IWorkingCopyBackupService } from "vs/workbench/services/workingCopy/common/workingCopyBackup";
import { IWorkingCopyService } from "vs/workbench/services/workingCopy/common/workingCopyService";
/**
 * Untitled file specific working copy model factory.
 */
export interface IUntitledFileWorkingCopyModelFactory<M extends IUntitledFileWorkingCopyModel> extends IFileWorkingCopyModelFactory<M> {
}
/**
 * The underlying model of a untitled file working copy provides
 * some methods for the untitled file working copy to function.
 * The model is typically only available after the working copy
 * has been resolved via it's `resolve()` method.
 */
export interface IUntitledFileWorkingCopyModel extends IFileWorkingCopyModel {
    readonly onDidChangeContent: Event<IUntitledFileWorkingCopyModelContentChangedEvent>;
}
export interface IUntitledFileWorkingCopyModelContentChangedEvent {
    /**
     * Flag that indicates that the content change should
     * clear the dirty/modified flags, e.g. because the contents are
     * back to being empty or back to an initial state that
     * should not be considered as modified.
     */
    readonly isInitial: boolean;
}
export interface IUntitledFileWorkingCopy<M extends IUntitledFileWorkingCopyModel> extends IFileWorkingCopy<M> {
    /**
     * Whether this untitled file working copy model has an associated file path.
     */
    readonly hasAssociatedFilePath: boolean;
    /**
     * Whether we have a resolved model or not.
     */
    isResolved(): this is IResolvedUntitledFileWorkingCopy<M>;
}
export interface IResolvedUntitledFileWorkingCopy<M extends IUntitledFileWorkingCopyModel> extends IUntitledFileWorkingCopy<M> {
    /**
     * A resolved untitled file working copy has a resolved model.
     */
    readonly model: M;
}
export interface IUntitledFileWorkingCopySaveDelegate<M extends IUntitledFileWorkingCopyModel> {
    /**
     * A delegate to enable saving of untitled file working copies.
     */
    (workingCopy: IUntitledFileWorkingCopy<M>, options?: ISaveOptions): Promise<boolean>;
}
export interface IUntitledFileWorkingCopyInitialContents {
    /**
     * The initial contents of the untitled file working copy.
     */
    readonly value: VSBufferReadableStream;
    /**
     * If not provided, the untitled file working copy will be marked
     * modified by default given initial contents are provided.
     *
     * Note: if the untitled file working copy has an associated path
     * the modified state will always be set.
     */
    readonly markModified?: boolean;
}
export declare class UntitledFileWorkingCopy<M extends IUntitledFileWorkingCopyModel> extends Disposable implements IUntitledFileWorkingCopy<M> {
    readonly typeId: string;
    readonly resource: URI;
    readonly name: string;
    readonly hasAssociatedFilePath: boolean;
    private readonly isScratchpad;
    private readonly initialContents;
    private readonly modelFactory;
    private readonly saveDelegate;
    private readonly workingCopyBackupService;
    private readonly logService;
    readonly capabilities: any;
    private _model;
    get model(): M | undefined;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: any;
    private readonly _onDidChangeDirty;
    readonly onDidChangeDirty: any;
    private readonly _onDidSave;
    readonly onDidSave: any;
    private readonly _onDidRevert;
    readonly onDidRevert: any;
    private readonly _onWillDispose;
    readonly onWillDispose: any;
    constructor(typeId: string, resource: URI, name: string, hasAssociatedFilePath: boolean, isScratchpad: boolean, initialContents: IUntitledFileWorkingCopyInitialContents | undefined, modelFactory: IUntitledFileWorkingCopyModelFactory<M>, saveDelegate: IUntitledFileWorkingCopySaveDelegate<M>, workingCopyService: IWorkingCopyService, workingCopyBackupService: IWorkingCopyBackupService, logService: ILogService);
    private modified;
    isDirty(): boolean;
    isModified(): boolean;
    private setModified;
    resolve(): Promise<void>;
    private doCreateModel;
    private installModelListeners;
    private onModelContentChanged;
    isResolved(): this is IResolvedUntitledFileWorkingCopy<M>;
    get backupDelay(): number | undefined;
    backup(token: CancellationToken): Promise<IWorkingCopyBackup>;
    save(options?: ISaveOptions): Promise<boolean>;
    revert(): Promise<void>;
    dispose(): void;
    private trace;
}
