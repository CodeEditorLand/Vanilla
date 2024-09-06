import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IProductService } from "vs/platform/product/common/productService";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IChatAgentService } from "vs/workbench/contrib/chat/common/chatAgents";
import { EmptyTextEditorHintContribution, IEmptyTextEditorHintOptions } from "vs/workbench/contrib/codeEditor/browser/emptyTextEditorHint/emptyTextEditorHint";
import { IInlineChatSessionService } from "vs/workbench/contrib/inlineChat/browser/inlineChatSessionService";
import { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
export declare class EmptyCellEditorHintContribution extends EmptyTextEditorHintContribution {
    private readonly _editorService;
    static readonly CONTRIB_ID = "notebook.editor.contrib.emptyCellEditorHint";
    constructor(editor: ICodeEditor, _editorService: IEditorService, editorGroupsService: IEditorGroupsService, commandService: ICommandService, configurationService: IConfigurationService, hoverService: IHoverService, keybindingService: IKeybindingService, inlineChatSessionService: IInlineChatSessionService, chatAgentService: IChatAgentService, telemetryService: ITelemetryService, productService: IProductService, contextMenuService: IContextMenuService);
    protected _getOptions(): IEmptyTextEditorHintOptions;
    protected _shouldRenderHint(): boolean;
}
