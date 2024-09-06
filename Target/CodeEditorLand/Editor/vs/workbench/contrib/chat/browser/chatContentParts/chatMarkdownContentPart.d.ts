import { IMarkdownString } from "vs/base/common/htmlContent";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { MarkdownRenderer } from "vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer";
import { ITextModelService } from "vs/editor/common/services/resolverService";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IChatCodeBlockInfo, IChatListItemRendererOptions } from "vs/workbench/contrib/chat/browser/chat";
import { IDisposableReference } from "vs/workbench/contrib/chat/browser/chatContentParts/chatCollections";
import { IChatContentPart, IChatContentPartRenderContext } from "vs/workbench/contrib/chat/browser/chatContentParts/chatContentParts";
import { IChatRendererDelegate } from "vs/workbench/contrib/chat/browser/chatListRenderer";
import { ChatEditorOptions } from "vs/workbench/contrib/chat/browser/chatOptions";
import { CodeBlockPart } from "vs/workbench/contrib/chat/browser/codeBlockPart";
import { IChatProgressRenderableResponseContent } from "vs/workbench/contrib/chat/common/chatModel";
import { CodeBlockModelCollection } from "vs/workbench/contrib/chat/common/codeBlockModelCollection";
export declare class ChatMarkdownContentPart extends Disposable implements IChatContentPart {
    private readonly markdown;
    private readonly editorPool;
    private readonly codeBlockModelCollection;
    private readonly textModelService;
    readonly domNode: HTMLElement;
    private readonly allRefs;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: any;
    readonly codeblocks: IChatCodeBlockInfo[];
    constructor(markdown: IMarkdownString, context: IChatContentPartRenderContext, editorPool: EditorPool, fillInIncompleteTokens: boolean | undefined, codeBlockStartIndex: number | undefined, renderer: MarkdownRenderer, currentWidth: number, codeBlockModelCollection: CodeBlockModelCollection, rendererOptions: IChatListItemRendererOptions, contextKeyService: IContextKeyService, textModelService: ITextModelService, instantiationService: IInstantiationService);
    private renderCodeBlock;
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
    layout(width: number): void;
    addDisposable(disposable: IDisposable): void;
}
export declare class EditorPool extends Disposable {
    private readonly _pool;
    inUse(): Iterable<CodeBlockPart>;
    constructor(options: ChatEditorOptions, delegate: IChatRendererDelegate, overflowWidgetsDomNode: HTMLElement | undefined, instantiationService: IInstantiationService);
    get(): IDisposableReference<CodeBlockPart>;
}
