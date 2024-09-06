import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
import { Command } from "../../../../../editor/common/languages.js";
import { IGotoSymbolQuickPickItem } from "../../../../../editor/contrib/quickAccess/browser/gotoSymbolQuickAccess.js";
import { IQuickPickItem } from "../../../../../platform/quickinput/common/quickInput.js";
import { ISymbolQuickPickItem } from "../../../search/browser/symbolsQuickAccess.js";
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
