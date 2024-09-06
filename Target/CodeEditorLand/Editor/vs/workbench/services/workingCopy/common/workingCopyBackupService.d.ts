import { VSBufferReadable, VSBufferReadableStream } from "vs/base/common/buffer";
import { CancellationToken } from "vs/base/common/cancellation";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IFileService } from "vs/platform/files/common/files";
import { ILogService } from "vs/platform/log/common/log";
import { IWorkingCopyBackupMeta, IWorkingCopyIdentifier } from "vs/workbench/services/workingCopy/common/workingCopy";
import { IResolvedWorkingCopyBackup, IWorkingCopyBackupService } from "vs/workbench/services/workingCopy/common/workingCopyBackup";
export declare class WorkingCopyBackupsModel {
    private backupRoot;
    private fileService;
    private readonly cache;
    static create(backupRoot: URI, fileService: IFileService): Promise<WorkingCopyBackupsModel>;
    private constructor();
    private resolve;
    add(resource: URI, versionId?: number, meta?: IWorkingCopyBackupMeta): void;
    update(resource: URI, meta?: IWorkingCopyBackupMeta): void;
    count(): number;
    has(resource: URI, versionId?: number, meta?: IWorkingCopyBackupMeta): boolean;
    get(): URI[];
    remove(resource: URI): void;
    clear(): void;
}
export declare abstract class WorkingCopyBackupService extends Disposable implements IWorkingCopyBackupService {
    protected fileService: IFileService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private impl;
    constructor(backupWorkspaceHome: URI | undefined, fileService: IFileService, logService: ILogService);
    private initialize;
    reinitialize(backupWorkspaceHome: URI | undefined): void;
    hasBackups(): Promise<boolean>;
    hasBackupSync(identifier: IWorkingCopyIdentifier, versionId?: number, meta?: IWorkingCopyBackupMeta): boolean;
    backup(identifier: IWorkingCopyIdentifier, content?: VSBufferReadableStream | VSBufferReadable, versionId?: number, meta?: IWorkingCopyBackupMeta, token?: CancellationToken): Promise<void>;
    discardBackup(identifier: IWorkingCopyIdentifier, token?: CancellationToken): Promise<void>;
    discardBackups(filter?: {
        except: IWorkingCopyIdentifier[];
    }): Promise<void>;
    getBackups(): Promise<IWorkingCopyIdentifier[]>;
    resolve<T extends IWorkingCopyBackupMeta>(identifier: IWorkingCopyIdentifier): Promise<IResolvedWorkingCopyBackup<T> | undefined>;
    toBackupResource(identifier: IWorkingCopyIdentifier): URI;
    joinBackups(): Promise<void>;
}
export declare class InMemoryWorkingCopyBackupService extends Disposable implements IWorkingCopyBackupService {
    readonly _serviceBrand: undefined;
    private backups;
    constructor();
    hasBackups(): Promise<boolean>;
    hasBackupSync(identifier: IWorkingCopyIdentifier, versionId?: number): boolean;
    backup(identifier: IWorkingCopyIdentifier, content?: VSBufferReadable | VSBufferReadableStream, versionId?: number, meta?: IWorkingCopyBackupMeta, token?: CancellationToken): Promise<void>;
    resolve<T extends IWorkingCopyBackupMeta>(identifier: IWorkingCopyIdentifier): Promise<IResolvedWorkingCopyBackup<T> | undefined>;
    getBackups(): Promise<IWorkingCopyIdentifier[]>;
    discardBackup(identifier: IWorkingCopyIdentifier): Promise<void>;
    discardBackups(filter?: {
        except: IWorkingCopyIdentifier[];
    }): Promise<void>;
    toBackupResource(identifier: IWorkingCopyIdentifier): URI;
    joinBackups(): Promise<void>;
}
export declare function hashIdentifier(identifier: IWorkingCopyIdentifier): string;