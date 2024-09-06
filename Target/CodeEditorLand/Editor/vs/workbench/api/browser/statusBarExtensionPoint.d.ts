import { Event } from "vs/base/common/event";
import { IMarkdownString } from "vs/base/common/htmlContent";
import { Iterable } from "vs/base/common/iterator";
import { ThemeColor } from "vs/base/common/themables";
import { Command } from "vs/editor/common/languages";
import { IAccessibilityInformation } from "vs/platform/accessibility/common/accessibility";
import { IStatusbarEntry, StatusbarAlignment as MainThreadStatusBarAlignment } from "vs/workbench/services/statusbar/browser/statusbar";
export declare const IExtensionStatusBarItemService: any;
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
export declare const enum StatusBarUpdateKind {
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
