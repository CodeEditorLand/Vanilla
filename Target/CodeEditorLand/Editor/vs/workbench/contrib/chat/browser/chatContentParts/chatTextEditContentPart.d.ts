import { Disposable, IDisposable, IReference } from "vs/base/common/lifecycle";
import { IResolvedTextEditorModel } from "vs/editor/common/services/resolverService";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IChatListItemRendererOptions } from "vs/workbench/contrib/chat/browser/chat";
import { IDisposableReference } from "vs/workbench/contrib/chat/browser/chatContentParts/chatCollections";
import { IChatContentPart, IChatContentPartRenderContext } from "vs/workbench/contrib/chat/browser/chatContentParts/chatContentParts";
import { IChatRendererDelegate } from "vs/workbench/contrib/chat/browser/chatListRenderer";
import { ChatEditorOptions } from "vs/workbench/contrib/chat/browser/chatOptions";
import { CodeCompareBlockPart } from "vs/workbench/contrib/chat/browser/codeBlockPart";
import { IChatProgressRenderableResponseContent, IChatTextEditGroup } from "vs/workbench/contrib/chat/common/chatModel";
import { IChatResponseViewModel } from "vs/workbench/contrib/chat/common/chatViewModel";
declare const ICodeCompareModelService: any;
interface ICodeCompareModelService {
    _serviceBrand: undefined;
    createModel(response: IChatResponseViewModel, chatTextEdit: IChatTextEditGroup): Promise<IReference<{
        originalSha1: string;
        original: IResolvedTextEditorModel;
        modified: IResolvedTextEditorModel;
    }>>;
}
export declare class ChatTextEditContentPart extends Disposable implements IChatContentPart {
    private readonly codeCompareModelService;
    readonly domNode: HTMLElement;
    private readonly comparePart;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: any;
    constructor(chatTextEdit: IChatTextEditGroup, context: IChatContentPartRenderContext, rendererOptions: IChatListItemRendererOptions, diffEditorPool: DiffEditorPool, currentWidth: number, codeCompareModelService: ICodeCompareModelService);
    layout(width: number): void;
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
    addDisposable(disposable: IDisposable): void;
}
export declare class DiffEditorPool extends Disposable {
    private readonly _pool;
    inUse(): Iterable<CodeCompareBlockPart>;
    constructor(options: ChatEditorOptions, delegate: IChatRendererDelegate, overflowWidgetsDomNode: HTMLElement | undefined, instantiationService: IInstantiationService);
    get(): IDisposableReference<CodeCompareBlockPart>;
}
export {};
