import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IRevertOptions, ISaveOptions } from "../../../common/editor.js";
import { IWorkingCopy, IWorkingCopyBackup, IWorkingCopySaveEvent, WorkingCopyCapabilities } from "./workingCopy.js";
/**
 * A resource based `IWorkingCopy` is backed by a `URI` from a
 * known file system provider.
 */
export interface IResourceWorkingCopy extends IWorkingCopy, IDisposable {
    /**
     * An event for when the orphaned state of the resource working copy changes.
     */
    readonly onDidChangeOrphaned: Event<void>;
    /**
     * Whether the resource working copy is orphaned or not.
     */
    isOrphaned(): boolean;
    /**
     * An event for when the file working copy has been disposed.
     */
    readonly onWillDispose: Event<void>;
    /**
     * Whether the file working copy has been disposed or not.
     */
    isDisposed(): boolean;
}
export declare abstract class ResourceWorkingCopy extends Disposable implements IResourceWorkingCopy {
    readonly resource: URI;
    protected readonly fileService: IFileService;
    constructor(resource: URI, fileService: IFileService);
    private readonly _onDidChangeOrphaned;
    readonly onDidChangeOrphaned: Event<void>;
    private orphaned;
    isOrphaned(): boolean;
    private onDidFilesChange;
    protected setOrphaned(orphaned: boolean): void;
    private readonly _onWillDispose;
    readonly onWillDispose: Event<void>;
    isDisposed(): boolean;
    dispose(): void;
    isModified(): boolean;
    abstract typeId: string;
    abstract name: string;
    abstract capabilities: WorkingCopyCapabilities;
    abstract onDidChangeDirty: Event<void>;
    abstract onDidChangeContent: Event<void>;
    abstract onDidSave: Event<IWorkingCopySaveEvent>;
    abstract isDirty(): boolean;
    abstract backup(token: CancellationToken): Promise<IWorkingCopyBackup>;
    abstract save(options?: ISaveOptions): Promise<boolean>;
    abstract revert(options?: IRevertOptions): Promise<void>;
}
