import { MarkdownRenderOptions, MarkedOptions } from "vs/base/browser/markdownRenderer";
import { IMarkdownString } from "vs/base/common/htmlContent";
import { IMarkdownRendererOptions, IMarkdownRenderResult, MarkdownRenderer } from "vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer";
import { ILanguageService } from "vs/editor/common/languages/language";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { ITrustedDomainService } from "vs/workbench/contrib/url/browser/trustedDomainService";
/**
 * This wraps the MarkdownRenderer and applies sanitizer options needed for Chat.
 */
export declare class ChatMarkdownRenderer extends MarkdownRenderer {
    private readonly trustedDomainService;
    private readonly hoverService;
    constructor(options: IMarkdownRendererOptions | undefined, languageService: ILanguageService, openerService: IOpenerService, trustedDomainService: ITrustedDomainService, hoverService: IHoverService);
    render(markdown: IMarkdownString | undefined, options?: MarkdownRenderOptions, markedOptions?: MarkedOptions): IMarkdownRenderResult;
    private attachCustomHover;
}
