import { IMarkdownString } from '../../../../../base/common/htmlContent.js';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { MarkdownRenderer } from '../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IChatCodeBlockInfo, IChatListItemRendererOptions } from '../chat.js';
import { IDisposableReference } from './chatCollections.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.js';
import { IChatRendererDelegate } from '../chatListRenderer.js';
import { ChatEditorOptions } from '../chatOptions.js';
import { CodeBlockPart } from '../codeBlockPart.js';
import { IChatProgressRenderableResponseContent } from '../../common/chatModel.js';
import { CodeBlockModelCollection } from '../../common/codeBlockModelCollection.js';
export declare class ChatMarkdownContentPart extends Disposable implements IChatContentPart {
    private readonly markdown;
    private readonly editorPool;
    private readonly codeBlockModelCollection;
    private readonly textModelService;
    readonly domNode: HTMLElement;
    private readonly allRefs;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: import("../../../../../base/common/event.js").Event<void>;
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
