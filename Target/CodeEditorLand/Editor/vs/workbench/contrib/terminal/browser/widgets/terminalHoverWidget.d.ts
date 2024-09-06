import type { IViewportRange } from "@xterm/xterm";
import type { IHoverAction } from "vs/base/browser/ui/hover/hover";
import { IMarkdownString } from "vs/base/common/htmlContent";
import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { ITerminalWidget } from "vs/workbench/contrib/terminal/browser/widgets/widgets";
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
