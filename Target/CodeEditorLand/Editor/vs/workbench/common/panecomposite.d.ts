import { IComposite } from "vs/workbench/common/composite";
import { IView, IViewPaneContainer } from "vs/workbench/common/views";
export interface IPaneComposite extends IComposite {
    /**
     * Returns the minimal width needed to avoid any content horizontal truncation
     */
    getOptimalWidth(): number | undefined;
    openView<T extends IView>(id: string, focus?: boolean): T | undefined;
    getViewPaneContainer(): IViewPaneContainer | undefined;
}
