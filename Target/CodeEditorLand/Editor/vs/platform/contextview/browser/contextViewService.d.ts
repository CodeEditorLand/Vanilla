import { IContextViewProvider } from "vs/base/browser/ui/contextview/contextview";
import { Disposable } from "vs/base/common/lifecycle";
import { ILayoutService } from "vs/platform/layout/browser/layoutService";
import { IContextViewDelegate, IContextViewService, IOpenContextView } from "./contextView";
export declare class ContextViewHandler extends Disposable implements IContextViewProvider {
    private readonly layoutService;
    private openContextView;
    protected readonly contextView: any;
    constructor(layoutService: ILayoutService);
    showContextView(delegate: IContextViewDelegate, container?: HTMLElement, shadowRoot?: boolean): IOpenContextView;
    layout(): void;
    hideContextView(data?: any): void;
}
export declare class ContextViewService extends ContextViewHandler implements IContextViewService {
    readonly _serviceBrand: undefined;
    getContextViewElement(): HTMLElement;
}
