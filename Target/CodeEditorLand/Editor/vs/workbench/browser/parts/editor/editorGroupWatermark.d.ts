import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
export declare class EditorGroupWatermark extends Disposable {
    private readonly keybindingService;
    private readonly contextService;
    private readonly contextKeyService;
    private readonly configurationService;
    private readonly shortcuts;
    private readonly transientDisposables;
    private enabled;
    private workbenchState;
    private keybindingLabels;
    constructor(container: HTMLElement, keybindingService: IKeybindingService, contextService: IWorkspaceContextService, contextKeyService: IContextKeyService, configurationService: IConfigurationService);
    private registerListeners;
    private render;
    private clear;
    dispose(): void;
}
