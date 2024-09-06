import { IComposite } from "./composite.js";
import { IView, IViewPaneContainer } from "./views.js";
export interface IPaneComposite extends IComposite {
    /**
     * Returns the minimal width needed to avoid any content horizontal truncation
     */
    getOptimalWidth(): number | undefined;
    openView<T extends IView>(id: string, focus?: boolean): T | undefined;
    getViewPaneContainer(): IViewPaneContainer | undefined;
}
