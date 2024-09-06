import { IHoverDelegate } from "vs/base/browser/ui/hover/hoverDelegate";
import { Event } from "vs/base/common/event";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IQuickInputService } from "vs/platform/quickinput/common/quickInput";
import { WindowTitle } from "vs/workbench/browser/parts/titlebar/windowTitle";
export declare class CommandCenterControl {
    private readonly _disposables;
    private readonly _onDidChangeVisibility;
    readonly onDidChangeVisibility: Event<void>;
    readonly element: HTMLElement;
    constructor(windowTitle: WindowTitle, hoverDelegate: IHoverDelegate, instantiationService: IInstantiationService, quickInputService: IQuickInputService);
    private _setVisibility;
    dispose(): void;
}
