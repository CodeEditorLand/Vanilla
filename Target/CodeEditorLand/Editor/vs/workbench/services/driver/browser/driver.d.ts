import { IEnvironmentService } from "vs/platform/environment/common/environment";
import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogFile } from "vs/platform/log/browser/log";
import { ILogService } from "vs/platform/log/common/log";
import { IElement, ILocaleInfo, ILocalizedStrings, IWindowDriver } from "vs/workbench/services/driver/common/driver";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle";
export declare class BrowserWindowDriver implements IWindowDriver {
    private readonly fileService;
    private readonly environmentService;
    private readonly lifecycleService;
    private readonly logService;
    constructor(fileService: IFileService, environmentService: IEnvironmentService, lifecycleService: ILifecycleService, logService: ILogService);
    getLogs(): Promise<ILogFile[]>;
    whenWorkbenchRestored(): Promise<void>;
    setValue(selector: string, text: string): Promise<void>;
    isActiveElement(selector: string): Promise<boolean>;
    getElements(selector: string, recursive: boolean): Promise<IElement[]>;
    private serializeElement;
    getElementXY(selector: string, xoffset?: number, yoffset?: number): Promise<{
        x: number;
        y: number;
    }>;
    typeInEditor(selector: string, text: string): Promise<void>;
    getTerminalBuffer(selector: string): Promise<string[]>;
    writeInTerminal(selector: string, text: string): Promise<void>;
    getLocaleInfo(): Promise<ILocaleInfo>;
    getLocalizedStrings(): Promise<ILocalizedStrings>;
    protected _getElementXY(selector: string, offset?: {
        x: number;
        y: number;
    }): Promise<{
        x: number;
        y: number;
    }>;
    exitApplication(): Promise<void>;
}
export declare function registerWindowDriver(instantiationService: IInstantiationService): void;
