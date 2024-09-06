import "vs/css!./bannerController";
import { MarkdownString } from "vs/base/common/htmlContent";
import { Disposable } from "vs/base/common/lifecycle";
import { ThemeIcon } from "vs/base/common/themables";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILinkDescriptor } from "vs/platform/opener/browser/link";
export declare class BannerController extends Disposable {
    private readonly _editor;
    private readonly instantiationService;
    private readonly banner;
    constructor(_editor: ICodeEditor, instantiationService: IInstantiationService);
    hide(): void;
    show(item: IBannerItem): void;
}
export interface IBannerItem {
    readonly id: string;
    readonly icon: ThemeIcon | undefined;
    readonly message: string | MarkdownString;
    readonly actions?: ILinkDescriptor[];
    readonly ariaLabel?: string;
    readonly onClose?: () => void;
}
