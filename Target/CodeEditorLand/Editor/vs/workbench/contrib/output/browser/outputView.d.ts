import "vs/css!./output";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IViewPaneOptions, ViewPane } from "vs/workbench/browser/parts/views/viewPane";
import { IViewDescriptorService } from "vs/workbench/common/views";
import { IOutputChannel } from "vs/workbench/services/output/common/output";
export declare class OutputViewPane extends ViewPane {
    private readonly editor;
    private channelId;
    private editorPromise;
    private readonly scrollLockContextKey;
    get scrollLock(): boolean;
    set scrollLock(scrollLock: boolean);
    constructor(options: IViewPaneOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService, hoverService: IHoverService);
    showChannel(channel: IOutputChannel, preserveFocus: boolean): void;
    focus(): void;
    protected renderBody(container: HTMLElement): void;
    protected layoutBody(height: number, width: number): void;
    private onDidChangeVisibility;
    private setInput;
    private clearInput;
    private createInput;
}