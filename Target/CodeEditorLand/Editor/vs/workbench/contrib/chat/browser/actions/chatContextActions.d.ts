import { ThemeIcon } from "vs/base/common/themables";
import { URI } from "vs/base/common/uri";
import { Command } from "vs/editor/common/languages";
import { IGotoSymbolQuickPickItem } from "vs/editor/contrib/quickAccess/browser/gotoSymbolQuickAccess";
import { IQuickPickItem } from "vs/platform/quickinput/common/quickInput";
import { ISymbolQuickPickItem } from "vs/workbench/contrib/search/browser/symbolsQuickAccess";
export declare function registerChatContextActions(): void;
export type IChatContextQuickPickItem = IFileQuickPickItem | IDynamicVariableQuickPickItem | IStaticVariableQuickPickItem | IGotoSymbolQuickPickItem | ISymbolQuickPickItem | IQuickAccessQuickPickItem | IToolQuickPickItem;
export interface IFileQuickPickItem extends IQuickPickItem {
    kind: "file";
    id: string;
    name: string;
    value: URI;
    isDynamic: true;
    resource: URI;
}
export interface IDynamicVariableQuickPickItem extends IQuickPickItem {
    kind: "dynamic";
    id: string;
    name?: string;
    value: unknown;
    isDynamic: true;
    icon?: ThemeIcon;
    command?: Command;
}
export interface IToolQuickPickItem extends IQuickPickItem {
    kind: "tool";
    id: string;
    name?: string;
    icon?: ThemeIcon;
}
export interface IStaticVariableQuickPickItem extends IQuickPickItem {
    kind: "static";
    id: string;
    name: string;
    value: unknown;
    isDynamic?: false;
    icon?: ThemeIcon;
}
export interface IQuickAccessQuickPickItem extends IQuickPickItem {
    kind: "quickaccess";
    id: string;
    name: string;
    value: string;
    prefix: string;
}
