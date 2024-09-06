import { ButtonBar } from "vs/base/browser/ui/button/button";
import { IAction } from "vs/base/common/actions";
import { Event } from "vs/base/common/event";
import { IToolBarRenderOptions } from "vs/platform/actions/browser/toolbar";
import { IMenuActionOptions, IMenuService, MenuId } from "vs/platform/actions/common/actions";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
export type IButtonConfigProvider = (action: IAction, index: number) => {
    showIcon?: boolean;
    showLabel?: boolean;
    isSecondary?: boolean;
} | undefined;
export interface IWorkbenchButtonBarOptions {
    telemetrySource?: string;
    buttonConfigProvider?: IButtonConfigProvider;
}
export declare class WorkbenchButtonBar extends ButtonBar {
    private readonly _options;
    private readonly _contextMenuService;
    private readonly _keybindingService;
    private readonly _hoverService;
    protected readonly _store: any;
    protected readonly _updateStore: any;
    private readonly _actionRunner;
    private readonly _onDidChange;
    readonly onDidChange: Event<this>;
    constructor(container: HTMLElement, _options: IWorkbenchButtonBarOptions | undefined, _contextMenuService: IContextMenuService, _keybindingService: IKeybindingService, telemetryService: ITelemetryService, _hoverService: IHoverService);
    dispose(): void;
    update(actions: IAction[], secondary: IAction[]): void;
}
export interface IMenuWorkbenchButtonBarOptions extends IWorkbenchButtonBarOptions {
    menuOptions?: IMenuActionOptions;
    toolbarOptions?: IToolBarRenderOptions;
}
export declare class MenuWorkbenchButtonBar extends WorkbenchButtonBar {
    constructor(container: HTMLElement, menuId: MenuId, options: IMenuWorkbenchButtonBarOptions | undefined, menuService: IMenuService, contextKeyService: IContextKeyService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, telemetryService: ITelemetryService, hoverService: IHoverService);
    dispose(): void;
    update(_actions: IAction[]): void;
}
