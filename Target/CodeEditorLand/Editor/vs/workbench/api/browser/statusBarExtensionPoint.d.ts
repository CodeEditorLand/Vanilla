import { type Event } from "../../../base/common/event.js";
import type { IMarkdownString } from "../../../base/common/htmlContent.js";
import type { ThemeColor } from "../../../base/common/themables.js";
import type { Command } from "../../../editor/common/languages.js";
import { type IAccessibilityInformation } from "../../../platform/accessibility/common/accessibility.js";
import { type IStatusbarEntry, type StatusbarAlignment as MainThreadStatusBarAlignment } from "../../services/statusbar/browser/statusbar.js";
export declare const IExtensionStatusBarItemService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtensionStatusBarItemService>;
export interface IExtensionStatusBarItemChangeEvent {
    readonly added?: ExtensionStatusBarEntry;
    readonly removed?: string;
}
export type ExtensionStatusBarEntry = [
    string,
    {
        entry: IStatusbarEntry;
        alignment: MainThreadStatusBarAlignment;
        priority: number;
    }
];
export declare enum StatusBarUpdateKind {
    DidDefine = 0,
    DidUpdate = 1
}
export interface IExtensionStatusBarItemService {
    readonly _serviceBrand: undefined;
    onDidChange: Event<IExtensionStatusBarItemChangeEvent>;
    setOrUpdateEntry(id: string, statusId: string, extensionId: string | undefined, name: string, text: string, tooltip: IMarkdownString | string | undefined, command: Command | undefined, color: string | ThemeColor | undefined, backgroundColor: ThemeColor | undefined, alignLeft: boolean, priority: number | undefined, accessibilityInformation: IAccessibilityInformation | undefined): StatusBarUpdateKind;
    unsetEntry(id: string): void;
    getEntries(): Iterable<ExtensionStatusBarEntry>;
}
export declare class StatusBarItemsExtensionPoint {
    constructor(statusBarItemsService: IExtensionStatusBarItemService);
}
