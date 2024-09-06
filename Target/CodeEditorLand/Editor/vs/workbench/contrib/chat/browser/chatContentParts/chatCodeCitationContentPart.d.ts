import { Disposable } from "vs/base/common/lifecycle";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { ChatTreeItem } from "vs/workbench/contrib/chat/browser/chat";
import { IChatContentPart, IChatContentPartRenderContext } from "vs/workbench/contrib/chat/browser/chatContentParts/chatContentParts";
import { IChatCodeCitations, IChatRendererContent } from "vs/workbench/contrib/chat/common/chatViewModel";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
export declare class ChatCodeCitationContentPart extends Disposable implements IChatContentPart {
    private readonly editorService;
    private readonly telemetryService;
    readonly domNode: HTMLElement;
    constructor(citations: IChatCodeCitations, context: IChatContentPartRenderContext, editorService: IEditorService, telemetryService: ITelemetryService);
    hasSameContent(other: IChatRendererContent, followingContent: IChatRendererContent[], element: ChatTreeItem): boolean;
}
