import { IMouseEvent } from "../../../../base/browser/mouseEvent.js";
import { IMenuService } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService, IContextViewService } from "../../../../platform/contextview/browser/contextView.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { IEditorContribution } from "../../../common/editorCommon.js";
export declare class ContextMenuController implements IEditorContribution {
    private readonly _contextMenuService;
    private readonly _contextViewService;
    private readonly _contextKeyService;
    private readonly _keybindingService;
    private readonly _menuService;
    private readonly _configurationService;
    private readonly _workspaceContextService;
    static readonly ID = "editor.contrib.contextmenu";
    static get(editor: ICodeEditor): ContextMenuController | null;
    private readonly _toDispose;
    private _contextMenuIsBeingShownCount;
    private readonly _editor;
    constructor(editor: ICodeEditor, _contextMenuService: IContextMenuService, _contextViewService: IContextViewService, _contextKeyService: IContextKeyService, _keybindingService: IKeybindingService, _menuService: IMenuService, _configurationService: IConfigurationService, _workspaceContextService: IWorkspaceContextService);
    private _onContextMenu;
    showContextMenu(anchor?: IMouseEvent | null): void;
    private _getMenuActions;
    private _doShowContextMenu;
    private _showScrollbarContextMenu;
    private _keybindingFor;
    dispose(): void;
}
