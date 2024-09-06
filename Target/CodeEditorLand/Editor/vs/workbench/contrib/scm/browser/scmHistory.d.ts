import { ColorIdentifier } from "vs/platform/theme/common/colorUtils";
import { ISCMHistoryItem, ISCMHistoryItemGraphNode, ISCMHistoryItemViewModel } from "vs/workbench/contrib/scm/common/history";
export declare const SWIMLANE_HEIGHT = 22;
export declare const SWIMLANE_WIDTH = 11;
/**
 * History graph colors (local, remote, base)
 */
export declare const historyItemGroupLocal: any;
export declare const historyItemGroupRemote: any;
export declare const historyItemGroupBase: any;
/**
 * History item hover color
 */
export declare const historyItemGroupHoverLabelForeground: any;
/**
 * History graph color registry
 */
export declare const colorRegistry: ColorIdentifier[];
export declare function renderSCMHistoryItemGraph(historyItemViewModel: ISCMHistoryItemViewModel): SVGElement;
export declare function renderSCMHistoryGraphPlaceholder(columns: ISCMHistoryItemGraphNode[]): HTMLElement;
export declare function toISCMHistoryItemViewModelArray(historyItems: ISCMHistoryItem[], colorMap?: Map<string, string>): ISCMHistoryItemViewModel[];
