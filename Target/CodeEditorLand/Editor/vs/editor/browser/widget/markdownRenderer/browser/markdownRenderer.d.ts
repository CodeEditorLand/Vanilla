import { MarkdownRenderOptions, MarkedOptions } from "vs/base/browser/markdownRenderer";
import { IMarkdownString, MarkdownStringTrustedOptions } from "vs/base/common/htmlContent";
import { DisposableStore, IDisposable } from "vs/base/common/lifecycle";
import "vs/css!./renderedMarkdown";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { ILanguageService } from "vs/editor/common/languages/language";
import { IOpenerService } from "vs/platform/opener/common/opener";
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
    readonly onDidRenderAsync: any;
    constructor(_options: IMarkdownRendererOptions, _languageService: ILanguageService, _openerService: IOpenerService);
    dispose(): void;
    render(markdown: IMarkdownString | undefined, options?: MarkdownRenderOptions, markedOptions?: MarkedOptions): IMarkdownRenderResult;
    protected _getRenderOptions(markdown: IMarkdownString, disposables: DisposableStore): MarkdownRenderOptions;
}
export declare function openLinkFromMarkdown(openerService: IOpenerService, link: string, isTrusted: boolean | MarkdownStringTrustedOptions | undefined): Promise<boolean>;
