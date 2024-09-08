import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { ChatTreeItem } from '../chat.js';
import { IChatRendererContent } from '../../common/chatViewModel.js';
export interface IChatContentPart extends IDisposable {
    domNode: HTMLElement;
    /**
     * Returns true if the other content is equivalent to what is already rendered in this content part.
     * Returns false if a rerender is needed.
     * followingContent is all the content that will be rendered after this content part (to support progress messages' behavior).
     */
    hasSameContent(other: IChatRendererContent, followingContent: IChatRendererContent[], element: ChatTreeItem): boolean;
}
export interface IChatContentPartRenderContext {
    element: ChatTreeItem;
    index: number;
    content: ReadonlyArray<IChatRendererContent>;
    preceedingContentParts: ReadonlyArray<IChatContentPart>;
}
