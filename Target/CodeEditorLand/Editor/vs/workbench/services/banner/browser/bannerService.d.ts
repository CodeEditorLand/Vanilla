import { MarkdownString } from "vs/base/common/htmlContent";
import { ThemeIcon } from "vs/base/common/themables";
import { URI } from "vs/base/common/uri";
import { ILinkDescriptor } from "vs/platform/opener/browser/link";
export interface IBannerItem {
    readonly id: string;
    readonly icon: ThemeIcon | URI | undefined;
    readonly message: string | MarkdownString;
    readonly actions?: ILinkDescriptor[];
    readonly ariaLabel?: string;
    readonly onClose?: () => void;
    readonly closeLabel?: string;
}
export declare const IBannerService: any;
export interface IBannerService {
    readonly _serviceBrand: undefined;
    focus(): void;
    focusNextAction(): void;
    focusPreviousAction(): void;
    hide(id: string): void;
    show(item: IBannerItem): void;
}
