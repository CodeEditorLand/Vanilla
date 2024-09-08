import { type IDisposable } from "../../../base/common/lifecycle.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
import { type IQuickAccessProvider } from "../common/quickAccess.js";
import { IQuickInputService, type IQuickPick, type IQuickPickItem } from "../common/quickInput.js";
interface IHelpQuickAccessPickItem extends IQuickPickItem {
    readonly prefix: string;
}
export declare class HelpQuickAccessProvider implements IQuickAccessProvider {
    private readonly quickInputService;
    private readonly keybindingService;
    static PREFIX: string;
    private readonly registry;
    constructor(quickInputService: IQuickInputService, keybindingService: IKeybindingService);
    provide(picker: IQuickPick<IHelpQuickAccessPickItem, {
        useSeparators: true;
    }>): IDisposable;
    getQuickAccessProviders(): IHelpQuickAccessPickItem[];
    private createPicks;
}
export {};
