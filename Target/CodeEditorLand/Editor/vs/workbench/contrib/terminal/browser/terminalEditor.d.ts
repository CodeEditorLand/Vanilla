import * as dom from "vs/base/browser/dom";
import { IActionViewItem } from "vs/base/browser/ui/actionbar/actionbar";
import { IBaseActionViewItemOptions } from "vs/base/browser/ui/actionbar/actionViewItems";
import { IAction } from "vs/base/common/actions";
import { CancellationToken } from "vs/base/common/cancellation";
import { IMenuService } from "vs/platform/actions/common/actions";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IEditorOptions } from "vs/platform/editor/common/editor";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { EditorPane } from "vs/workbench/browser/parts/editor/editorPane";
import { IEditorOpenContext } from "vs/workbench/common/editor";
import { ITerminalConfigurationService, ITerminalEditorService, ITerminalService } from "vs/workbench/contrib/terminal/browser/terminal";
import { TerminalEditorInput } from "vs/workbench/contrib/terminal/browser/terminalEditorInput";
import { ITerminalProfileResolverService, ITerminalProfileService } from "vs/workbench/contrib/terminal/common/terminal";
import { IEditorGroup } from "vs/workbench/services/editor/common/editorGroupsService";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
export declare class TerminalEditor extends EditorPane {
    private readonly _terminalEditorService;
    private readonly _terminalProfileResolverService;
    private readonly _terminalService;
    private readonly _terminalConfigurationService;
    private readonly _instantiationService;
    private readonly _contextMenuService;
    private readonly _terminalProfileService;
    private readonly _workbenchLayoutService;
    private _editorInstanceElement;
    private _overflowGuardElement;
    private _editorInput?;
    private _lastDimension?;
    private readonly _dropdownMenu;
    private readonly _instanceMenu;
    private _cancelContextMenu;
    private readonly _disposableStore;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService, _terminalEditorService: ITerminalEditorService, _terminalProfileResolverService: ITerminalProfileResolverService, _terminalService: ITerminalService, _terminalConfigurationService: ITerminalConfigurationService, contextKeyService: IContextKeyService, menuService: IMenuService, _instantiationService: IInstantiationService, _contextMenuService: IContextMenuService, _terminalProfileService: ITerminalProfileService, _workbenchLayoutService: IWorkbenchLayoutService);
    setInput(newInput: TerminalEditorInput, options: IEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    clearInput(): void;
    private _setActiveInstance;
    focus(): void;
    protected createEditor(parent: HTMLElement): void;
    private _registerListeners;
    layout(dimension: dom.Dimension): void;
    setVisible(visible: boolean): void;
    getActionViewItem(action: IAction, options: IBaseActionViewItemOptions): IActionViewItem | undefined;
    /**
     * Actions might be of type Action (disposable) or Separator or SubmenuAction, which don't extend Disposable
     */
    private _registerDisposableActions;
    private _getDefaultProfileName;
}
