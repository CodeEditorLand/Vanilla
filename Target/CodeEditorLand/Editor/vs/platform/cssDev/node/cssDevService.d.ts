import { IEnvironmentService } from "vs/platform/environment/common/environment";
import { ILogService } from "vs/platform/log/common/log";
export declare const ICSSDevelopmentService: any;
export interface ICSSDevelopmentService {
    _serviceBrand: undefined;
    isEnabled: boolean;
    getCssModules(): Promise<string[]>;
}
export declare class CSSDevelopmentService implements ICSSDevelopmentService {
    private readonly envService;
    private readonly logService;
    _serviceBrand: undefined;
    private _cssModules?;
    constructor(envService: IEnvironmentService, logService: ILogService);
    get isEnabled(): boolean;
    getCssModules(): Promise<string[]>;
    private computeCssModules;
}
