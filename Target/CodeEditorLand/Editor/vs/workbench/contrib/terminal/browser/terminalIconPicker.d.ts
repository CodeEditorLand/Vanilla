import { Disposable } from "vs/base/common/lifecycle";
import type { ThemeIcon } from "vs/base/common/themables";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
export declare class TerminalIconPicker extends Disposable {
    private readonly _hoverService;
    private readonly _iconSelectBox;
    constructor(instantiationService: IInstantiationService, _hoverService: IHoverService);
    pickIcons(): Promise<ThemeIcon | undefined>;
}
