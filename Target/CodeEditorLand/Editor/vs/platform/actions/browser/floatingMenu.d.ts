import { Widget } from "vs/base/browser/ui/widget";
import { IAction } from "vs/base/common/actions";
import { Disposable, DisposableStore } from "vs/base/common/lifecycle";
import { IMenuService, MenuId } from "vs/platform/actions/common/actions";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
export declare class FloatingClickWidget extends Widget {
    private label;
    private readonly _onClick;
    readonly onClick: any;
    private _domNode;
    constructor(label: string);
    getDomNode(): HTMLElement;
    render(): void;
}
export declare abstract class AbstractFloatingClickMenu extends Disposable {
    private readonly renderEmitter;
    protected readonly onDidRender: any;
    private readonly menu;
    constructor(menuId: MenuId, menuService: IMenuService, contextKeyService: IContextKeyService);
    /** Should be called in implementation constructors after they initialized */
    protected render(): void;
    protected abstract createWidget(action: IAction, disposables: DisposableStore): FloatingClickWidget;
    protected getActionArg(): unknown;
    protected isVisible(): boolean;
}
export declare class FloatingClickMenu extends AbstractFloatingClickMenu {
    private readonly options;
    private readonly instantiationService;
    constructor(options: {
        /** Element the menu should be rendered into. */
        container: HTMLElement;
        /** Menu to show. If no actions are present, the button is hidden. */
        menuId: MenuId;
        /** Argument provided to the menu action */
        getActionArg: () => void;
    }, instantiationService: IInstantiationService, menuService: IMenuService, contextKeyService: IContextKeyService);
    protected createWidget(action: IAction, disposable: DisposableStore): FloatingClickWidget;
    protected getActionArg(): unknown;
}
