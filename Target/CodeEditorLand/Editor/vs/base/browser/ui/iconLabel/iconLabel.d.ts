import "vs/css!./iconlabel";
import type { IManagedHoverTooltipMarkdownString } from "vs/base/browser/ui/hover/hover";
import { IHoverDelegate } from "vs/base/browser/ui/hover/hoverDelegate";
import { IMatch } from "vs/base/common/filters";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
export interface IIconLabelCreationOptions {
    readonly supportHighlights?: boolean;
    readonly supportDescriptionHighlights?: boolean;
    readonly supportIcons?: boolean;
    readonly hoverDelegate?: IHoverDelegate;
}
export interface IIconLabelValueOptions {
    title?: string | IManagedHoverTooltipMarkdownString;
    descriptionTitle?: string | IManagedHoverTooltipMarkdownString;
    suffix?: string;
    hideIcon?: boolean;
    extraClasses?: readonly string[];
    italic?: boolean;
    strikethrough?: boolean;
    matches?: readonly IMatch[];
    labelEscapeNewLines?: boolean;
    descriptionMatches?: readonly IMatch[];
    disabledCommand?: boolean;
    readonly separator?: string;
    readonly domId?: string;
    iconPath?: URI;
}
export declare class IconLabel extends Disposable {
    private readonly creationOptions?;
    private readonly domNode;
    private readonly nameContainer;
    private readonly nameNode;
    private descriptionNode;
    private suffixNode;
    private readonly labelContainer;
    private readonly hoverDelegate;
    private readonly customHovers;
    constructor(container: HTMLElement, options?: IIconLabelCreationOptions);
    get element(): HTMLElement;
    setLabel(label: string | string[], description?: string, options?: IIconLabelValueOptions): void;
    private setupHover;
    dispose(): void;
    private getOrCreateSuffixNode;
    private getOrCreateDescriptionNode;
}
