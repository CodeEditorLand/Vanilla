import { Disposable } from "vs/base/common/lifecycle";
import { IStorageService } from "vs/platform/storage/common/storage";
export interface IAccessibleViewInformationService {
    _serviceBrand: undefined;
    hasShownAccessibleView(viewId: string): boolean;
}
export declare const IAccessibleViewInformationService: any;
export declare class AccessibleViewInformationService extends Disposable implements IAccessibleViewInformationService {
    private readonly _storageService;
    readonly _serviceBrand: undefined;
    constructor(_storageService: IStorageService);
    hasShownAccessibleView(viewId: string): boolean;
}
