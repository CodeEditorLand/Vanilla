import { MarkdownRenderOptions, MarkedOptions } from "../../../../../base/browser/markdownRenderer.js";
import { IMarkdownString, MarkdownStringTrustedOptions } from "../../../../../base/common/htmlContent.js";
import { DisposableStore, IDisposable } from "../../../../../base/common/lifecycle.js";
import "./renderedMarkdown.css";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { ILanguageService } from "../../../../common/languages/language.js";
import { ICodeEditor } from "../../../editorBrowser.js";
export interface IMarkdownRenderResult extends IDisposable {
    readonly element: HTMLElement;
}
export interface IMarkdownRendererOptions {
    readonly editor?: ICodeEditor;
    readonly codeBlockFontFamily?: string;
    readonly codeBlockFontSize?: string;
}
/**
 * Markdown renderer that can render codeblocks with the editor mechanics. This
 * renderer should always be preferred.
 */
export declare class MarkdownRenderer {
    private readonly _options;
    private readonly _languageService;
    private readonly _openerService;
    private static _ttpTokenizer;
    private readonly _onDidRenderAsync;
    readonly onDidRenderAsync: import("../../../../../base/common/event.js").Event<void>;
    constructor(_options: IMarkdownRendererOptions, _languageService: ILanguageService, _openerService: IOpenerService);
    dispose(): void;
    render(markdown: IMarkdownString | undefined, options?: MarkdownRenderOptions, markedOptions?: MarkedOptions): IMarkdownRenderResult;
    protected _getRenderOptions(markdown: IMarkdownString, disposables: DisposableStore): MarkdownRenderOptions;
    protected openMarkdownLink(link: string, markdown: IMarkdownString): Promise<void>;
}
export declare function openLinkFromMarkdown(openerService: IOpenerService, link: string, isTrusted: boolean | MarkdownStringTrustedOptions | undefined): Promise<boolean>;
