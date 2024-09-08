import { type ColorIdentifier } from "../../../../platform/theme/common/colorUtils.js";
import type { ISCMHistoryItem, ISCMHistoryItemGraphNode, ISCMHistoryItemViewModel } from "../common/history.js";
export declare const SWIMLANE_HEIGHT = 22;
export declare const SWIMLANE_WIDTH = 11;
/**
 * History graph colors (local, remote, base)
 */
export declare const historyItemGroupLocal: string;
export declare const historyItemGroupRemote: string;
export declare const historyItemGroupBase: string;
/**
 * History item hover color
 */
export declare const historyItemHoverDefaultLabelForeground: string;
export declare const historyItemHoverDefaultLabelBackground: string;
export declare const historyItemHoverLabelForeground: string;
export declare const historyItemHoverAdditionsForeground: string;
export declare const historyItemHoverDeletionsForeground: string;
/**
 * History graph color registry
 */
export declare const colorRegistry: ColorIdentifier[];
export declare function renderSCMHistoryItemGraph(historyItemViewModel: ISCMHistoryItemViewModel): SVGElement;
export declare function renderSCMHistoryGraphPlaceholder(columns: ISCMHistoryItemGraphNode[]): HTMLElement;
export declare function toISCMHistoryItemViewModelArray(historyItems: ISCMHistoryItem[], colorMap?: Map<string, string>): ISCMHistoryItemViewModel[];
