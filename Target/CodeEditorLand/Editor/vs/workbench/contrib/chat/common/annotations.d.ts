import { IRange } from "vs/editor/common/core/range";
import { IChatProgressRenderableResponseContent, IChatProgressResponseContent } from "vs/workbench/contrib/chat/common/chatModel";
import { IChatMarkdownContent } from "vs/workbench/contrib/chat/common/chatService";
export declare const contentRefUrl = "http://_vscodecontentref_";
export declare function annotateSpecialMarkdownContent(response: ReadonlyArray<IChatProgressResponseContent>): IChatProgressRenderableResponseContent[];
export interface IMarkdownVulnerability {
    readonly title: string;
    readonly description: string;
    readonly range: IRange;
}
export declare function annotateVulnerabilitiesInText(response: ReadonlyArray<IChatProgressResponseContent>): readonly IChatMarkdownContent[];
export declare function extractVulnerabilitiesFromText(text: string): {
    newText: string;
    vulnerabilities: IMarkdownVulnerability[];
};
