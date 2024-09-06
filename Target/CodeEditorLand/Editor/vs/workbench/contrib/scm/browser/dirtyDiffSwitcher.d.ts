import { SelectActionViewItem } from "vs/base/browser/ui/actionbar/actionViewItems";
import { ISelectOptionItem } from "vs/base/browser/ui/selectBox/selectBox";
import { Action, IAction } from "vs/base/common/actions";
import { IContextViewService } from "vs/platform/contextview/browser/contextView";
import { IThemeService } from "vs/platform/theme/common/themeService";
export interface IQuickDiffSelectItem extends ISelectOptionItem {
    provider: string;
}
export declare class SwitchQuickDiffViewItem extends SelectActionViewItem<IQuickDiffSelectItem> {
    private readonly optionsItems;
    constructor(action: IAction, providers: string[], selected: string, contextViewService: IContextViewService, themeService: IThemeService);
    setSelection(provider: string): void;
    protected getActionContext(_: string, index: number): IQuickDiffSelectItem;
    render(container: HTMLElement): void;
}
export declare class SwitchQuickDiffBaseAction extends Action {
    private readonly callback;
    static readonly ID = "quickDiff.base.switch";
    static readonly LABEL: any;
    constructor(callback: (event?: IQuickDiffSelectItem) => void);
    run(event?: IQuickDiffSelectItem): Promise<void>;
}
