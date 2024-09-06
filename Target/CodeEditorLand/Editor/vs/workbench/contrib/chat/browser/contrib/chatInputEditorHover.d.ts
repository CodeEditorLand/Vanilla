import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { Range } from "vs/editor/common/core/range";
import { IModelDecoration } from "vs/editor/common/model";
import { HoverAnchor, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart, IRenderedHoverParts } from "vs/editor/contrib/hover/browser/hoverTypes";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IChatWidgetService } from "vs/workbench/contrib/chat/browser/chat";
import { IChatAgentData } from "vs/workbench/contrib/chat/common/chatAgents";
export declare class ChatAgentHoverParticipant implements IEditorHoverParticipant<ChatAgentHoverPart> {
    private readonly editor;
    private readonly instantiationService;
    private readonly chatWidgetService;
    private readonly commandService;
    readonly hoverOrdinal: number;
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService, chatWidgetService: IChatWidgetService, commandService: ICommandService);
    computeSync(anchor: HoverAnchor, _lineDecorations: IModelDecoration[]): ChatAgentHoverPart[];
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: ChatAgentHoverPart[]): IRenderedHoverParts<ChatAgentHoverPart>;
    getAccessibleContent(hoverPart: ChatAgentHoverPart): string;
}
export declare class ChatAgentHoverPart implements IHoverPart {
    readonly owner: IEditorHoverParticipant<ChatAgentHoverPart>;
    readonly range: Range;
    readonly agent: IChatAgentData;
    constructor(owner: IEditorHoverParticipant<ChatAgentHoverPart>, range: Range, agent: IChatAgentData);
    isValidForHoverAnchor(anchor: HoverAnchor): boolean;
}
