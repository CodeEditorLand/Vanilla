import { BaseActionViewItem, IBaseActionViewItemOptions, SelectActionViewItem } from "vs/base/browser/ui/actionbar/actionViewItems";
import { IAction } from "vs/base/common/actions";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextViewService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IDebugService, IDebugSession } from "vs/workbench/contrib/debug/common/debug";
export declare class StartDebugActionViewItem extends BaseActionViewItem {
    private context;
    private readonly debugService;
    private readonly configurationService;
    private readonly commandService;
    private readonly contextService;
    private readonly keybindingService;
    private readonly hoverService;
    private readonly contextKeyService;
    private static readonly SEPARATOR;
    private container;
    private start;
    private selectBox;
    private debugOptions;
    private toDispose;
    private selected;
    private providers;
    constructor(context: unknown, action: IAction, options: IBaseActionViewItemOptions, debugService: IDebugService, configurationService: IConfigurationService, commandService: ICommandService, contextService: IWorkspaceContextService, contextViewService: IContextViewService, keybindingService: IKeybindingService, hoverService: IHoverService, contextKeyService: IContextKeyService);
    private registerListeners;
    render(container: HTMLElement): void;
    setActionContext(context: any): void;
    isEnabled(): boolean;
    focus(fromRight?: boolean): void;
    blur(): void;
    setFocusable(focusable: boolean): void;
    dispose(): void;
    private updateOptions;
    private _setAriaLabel;
}
export declare class FocusSessionActionViewItem extends SelectActionViewItem<IDebugSession> {
    protected readonly debugService: IDebugService;
    private readonly configurationService;
    constructor(action: IAction, session: IDebugSession | undefined, debugService: IDebugService, contextViewService: IContextViewService, configurationService: IConfigurationService);
    protected getActionContext(_: string, index: number): IDebugSession;
    private update;
    private getSelectedSession;
    protected getSessions(): ReadonlyArray<IDebugSession>;
    protected mapFocusedSessionToSelected(focusedSession: IDebugSession): IDebugSession;
}
