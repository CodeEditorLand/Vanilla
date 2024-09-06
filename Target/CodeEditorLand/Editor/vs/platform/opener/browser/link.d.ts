import { Disposable } from "vs/base/common/lifecycle";
import { IOpenerService } from "vs/platform/opener/common/opener";
import "vs/css!./link";
import { IHoverDelegate } from "vs/base/browser/ui/hover/hoverDelegate";
import { IHoverService } from "vs/platform/hover/browser/hover";
export interface ILinkDescriptor {
    readonly label: string | HTMLElement;
    readonly href: string;
    readonly title?: string;
    readonly tabIndex?: number;
}
export interface ILinkOptions {
    readonly opener?: (href: string) => void;
    readonly hoverDelegate?: IHoverDelegate;
    readonly textLinkForeground?: string;
}
export declare class Link extends Disposable {
    private _link;
    private readonly _hoverService;
    private el;
    private hover?;
    private hoverDelegate;
    private _enabled;
    get enabled(): boolean;
    set enabled(enabled: boolean);
    set link(link: ILinkDescriptor);
    constructor(container: HTMLElement, _link: ILinkDescriptor, options: ILinkOptions | undefined, _hoverService: IHoverService, openerService: IOpenerService);
    private setTooltip;
}
