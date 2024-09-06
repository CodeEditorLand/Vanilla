import type { IManagedHoverContent, IManagedHoverOptions } from "vs/base/browser/ui/hover/hover";
import type { IHoverDelegate, IHoverDelegateTarget } from "vs/base/browser/ui/hover/hoverDelegate";
import { IDisposable } from "vs/base/common/lifecycle";
export declare class ManagedHoverWidget implements IDisposable {
    private hoverDelegate;
    private target;
    private fadeInAnimation;
    private _hoverWidget;
    private _cancellationTokenSource;
    constructor(hoverDelegate: IHoverDelegate, target: IHoverDelegateTarget | HTMLElement, fadeInAnimation: boolean);
    update(content: IManagedHoverContent, focus?: boolean, options?: IManagedHoverOptions): Promise<void>;
    private show;
    private hasContent;
    get isDisposed(): any;
    dispose(): void;
}
