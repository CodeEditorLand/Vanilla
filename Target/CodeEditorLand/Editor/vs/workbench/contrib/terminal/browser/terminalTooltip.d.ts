import type { IHoverAction } from "vs/base/browser/ui/hover/hover";
import { MarkdownString } from "vs/base/common/htmlContent";
import { ITerminalInstance } from "vs/workbench/contrib/terminal/browser/terminal";
export declare function getInstanceHoverInfo(instance: ITerminalInstance): {
    content: MarkdownString;
    actions: IHoverAction[];
};
export declare function getShellIntegrationTooltip(instance: ITerminalInstance, markdown: boolean): string;
export declare function getShellProcessTooltip(instance: ITerminalInstance, markdown: boolean): string;
