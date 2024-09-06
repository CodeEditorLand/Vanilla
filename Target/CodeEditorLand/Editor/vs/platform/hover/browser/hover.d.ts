import type { IHoverDelegate2, IHoverOptions, IHoverWidget } from "vs/base/browser/ui/hover/hover";
import { IHoverDelegate, IHoverDelegateOptions } from "vs/base/browser/ui/hover/hoverDelegate";
import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
export declare const IHoverService: any;
export interface IHoverService extends IHoverDelegate2 {
    readonly _serviceBrand: undefined;
}
export declare class WorkbenchHoverDelegate extends Disposable implements IHoverDelegate {
    readonly placement: "mouse" | "element";
    private readonly instantHover;
    private overrideOptions;
    private readonly configurationService;
    private readonly hoverService;
    private lastHoverHideTime;
    private timeLimit;
    private _delay;
    get delay(): number;
    private readonly hoverDisposables;
    constructor(placement: "mouse" | "element", instantHover: boolean, overrideOptions: Partial<IHoverOptions> | ((options: IHoverDelegateOptions, focus?: boolean) => Partial<IHoverOptions>), configurationService: IConfigurationService, hoverService: IHoverService);
    showHover(options: IHoverDelegateOptions, focus?: boolean): IHoverWidget | undefined;
    private isInstantlyHovering;
    setInstantHoverTimeLimit(timeLimit: number): void;
    onDidHideHover(): void;
}
export declare const nativeHoverDelegate: IHoverDelegate;
