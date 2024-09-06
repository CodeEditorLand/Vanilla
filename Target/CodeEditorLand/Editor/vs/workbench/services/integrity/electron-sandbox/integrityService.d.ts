import { IChecksumService } from "vs/platform/checksum/common/checksumService";
import { ILogService } from "vs/platform/log/common/log";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IProductService } from "vs/platform/product/common/productService";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IIntegrityService, IntegrityTestResult } from "vs/workbench/services/integrity/common/integrity";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle";
export declare class IntegrityService implements IIntegrityService {
    private readonly notificationService;
    private readonly storageService;
    private readonly lifecycleService;
    private readonly openerService;
    private readonly productService;
    private readonly checksumService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly _storage;
    private readonly _isPurePromise;
    isPure(): Promise<IntegrityTestResult>;
    constructor(notificationService: INotificationService, storageService: IStorageService, lifecycleService: ILifecycleService, openerService: IOpenerService, productService: IProductService, checksumService: IChecksumService, logService: ILogService);
    private _compute;
    private _isPure;
    private _resolve;
    private static _createChecksumPair;
    private _showNotification;
}
