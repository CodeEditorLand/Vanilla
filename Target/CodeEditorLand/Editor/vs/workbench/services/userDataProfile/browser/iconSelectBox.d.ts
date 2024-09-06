import { IconSelectBox, IIconSelectBoxOptions } from "vs/base/browser/ui/icons/iconSelectBox";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
export declare const WorkbenchIconSelectBoxFocusContextKey: any;
export declare const WorkbenchIconSelectBoxInputFocusContextKey: any;
export declare const WorkbenchIconSelectBoxInputEmptyContextKey: any;
export declare class WorkbenchIconSelectBox extends IconSelectBox {
    private static focusedWidget;
    static getFocusedWidget(): WorkbenchIconSelectBox | undefined;
    private readonly contextKeyService;
    private readonly inputFocusContextKey;
    private readonly inputEmptyContextKey;
    constructor(options: IIconSelectBoxOptions, contextKeyService: IContextKeyService);
    focus(): void;
}
