import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IEncryptionService } from "vs/platform/encryption/common/encryptionService";
import { INativeEnvironmentService } from "vs/platform/environment/common/environment";
import { ILogService } from "vs/platform/log/common/log";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { BaseSecretStorageService } from "vs/platform/secrets/common/secrets";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IJSONEditingService } from "vs/workbench/services/configuration/common/jsonEditing";
export declare class NativeSecretStorageService extends BaseSecretStorageService {
    private readonly _notificationService;
    private readonly _dialogService;
    private readonly _openerService;
    private readonly _jsonEditingService;
    private readonly _environmentService;
    constructor(_notificationService: INotificationService, _dialogService: IDialogService, _openerService: IOpenerService, _jsonEditingService: IJSONEditingService, _environmentService: INativeEnvironmentService, storageService: IStorageService, encryptionService: IEncryptionService, logService: ILogService);
    set(key: string, value: string): Promise<void>;
    private notifyOfNoEncryptionOnce;
    private notifyOfNoEncryption;
}
