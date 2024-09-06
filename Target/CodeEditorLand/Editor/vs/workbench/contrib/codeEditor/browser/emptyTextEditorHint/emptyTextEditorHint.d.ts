import "vs/css!./emptyTextEditorHint";
import { IDisposable } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IProductService } from "vs/platform/product/common/productService";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IChatAgentService } from "vs/workbench/contrib/chat/common/chatAgents";
import { IInlineChatSessionService } from "vs/workbench/contrib/inlineChat/browser/inlineChatSessionService";
import { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
export interface IEmptyTextEditorHintOptions {
    readonly clickable?: boolean;
}
export declare const emptyTextEditorHintSetting = "workbench.editor.empty.hint";
export declare class EmptyTextEditorHintContribution implements IEditorContribution {
    protected readonly editor: ICodeEditor;
    private readonly editorGroupsService;
    private readonly commandService;
    protected readonly configurationService: IConfigurationService;
    protected readonly hoverService: IHoverService;
    private readonly keybindingService;
    private readonly inlineChatSessionService;
    private readonly chatAgentService;
    private readonly telemetryService;
    protected readonly productService: IProductService;
    private readonly contextMenuService;
    static readonly ID = "editor.contrib.emptyTextEditorHint";
    protected toDispose: IDisposable[];
    private textHintContentWidget;
    constructor(editor: ICodeEditor, editorGroupsService: IEditorGroupsService, commandService: ICommandService, configurationService: IConfigurationService, hoverService: IHoverService, keybindingService: IKeybindingService, inlineChatSessionService: IInlineChatSessionService, chatAgentService: IChatAgentService, telemetryService: ITelemetryService, productService: IProductService, contextMenuService: IContextMenuService);
    protected _getOptions(): IEmptyTextEditorHintOptions;
    protected _shouldRenderHint(): boolean;
    protected update(): void;
    dispose(): void;
}
