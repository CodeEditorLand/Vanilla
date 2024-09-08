import type { MarkdownString } from "../../../../base/common/htmlContent.js";
import type { ThemeIcon } from "../../../../base/common/themables.js";
import type { URI } from "../../../../base/common/uri.js";
import type { ILinkDescriptor } from "../../../../platform/opener/browser/link.js";
export interface IBannerItem {
    readonly id: string;
    readonly icon: ThemeIcon | URI | undefined;
    readonly message: string | MarkdownString;
    readonly actions?: ILinkDescriptor[];
    readonly ariaLabel?: string;
    readonly onClose?: () => void;
    readonly closeLabel?: string;
}
export declare const IBannerService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IBannerService>;
export interface IBannerService {
    readonly _serviceBrand: undefined;
    focus(): void;
    focusNextAction(): void;
    focusPreviousAction(): void;
    hide(id: string): void;
    show(item: IBannerItem): void;
}