import type { IRange } from "../../../../editor/common/core/range.js";
import { type IChatProgressRenderableResponseContent, type IChatProgressResponseContent } from "./chatModel.js";
import type { IChatMarkdownContent } from "./chatService.js";
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
