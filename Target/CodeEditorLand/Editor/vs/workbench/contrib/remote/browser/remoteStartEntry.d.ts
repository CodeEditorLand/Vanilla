import { Disposable } from "vs/base/common/lifecycle";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IExtensionManagementService } from "vs/platform/extensionManagement/common/extensionManagement";
import { IProductService } from "vs/platform/product/common/productService";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IWorkbenchExtensionEnablementService } from "vs/workbench/services/extensionManagement/common/extensionManagement";
export declare const showStartEntryInWeb: any;
export declare class RemoteStartEntry extends Disposable implements IWorkbenchContribution {
    private readonly commandService;
    private readonly productService;
    private readonly extensionManagementService;
    private readonly extensionEnablementService;
    private readonly telemetryService;
    private readonly contextKeyService;
    private static readonly REMOTE_WEB_START_ENTRY_ACTIONS_COMMAND_ID;
    private readonly remoteExtensionId;
    private readonly startCommand;
    constructor(commandService: ICommandService, productService: IProductService, extensionManagementService: IExtensionManagementService, extensionEnablementService: IWorkbenchExtensionEnablementService, telemetryService: ITelemetryService, contextKeyService: IContextKeyService);
    private registerActions;
    private registerListeners;
    private _init;
    private showWebRemoteStartActions;
}
