import type { IViewportRange } from "@xterm/xterm";
import type { IHoverAction } from "../../../../../base/browser/ui/hover/hover.js";
import type { IMarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import type { ITerminalWidget } from "./widgets.js";
export interface ILinkHoverTargetOptions {
    readonly viewportRange: IViewportRange;
    readonly cellDimensions: {
        width: number;
        height: number;
    };
    readonly terminalDimensions: {
        width: number;
        height: number;
    };
    readonly modifierDownCallback?: () => void;
    readonly modifierUpCallback?: () => void;
}
export declare class TerminalHover extends Disposable implements ITerminalWidget {
    private readonly _targetOptions;
    private readonly _text;
    private readonly _actions;
    private readonly _linkHandler;
    private readonly _hoverService;
    private readonly _configurationService;
    readonly id = "hover";
    constructor(_targetOptions: ILinkHoverTargetOptions, _text: IMarkdownString, _actions: IHoverAction[] | undefined, _linkHandler: (url: string) => any, _hoverService: IHoverService, _configurationService: IConfigurationService);
    attach(container: HTMLElement): void;
}