import { Disposable } from "../../../base/common/lifecycle.js";
import type { ViewContext } from "../../common/viewModel/viewContext.js";
import { type IMouseTarget } from "../editorBrowser.js";
import { EditorMouseEvent } from "../editorDom.js";
import type { ViewController } from "../view/viewController.js";
import { type IPointerHandlerHelper, MouseHandler } from "./mouseHandler.js";
/**
 * Currently only tested on iOS 13/ iPadOS.
 */
export declare class PointerEventHandler extends MouseHandler {
    private _lastPointerType;
    constructor(context: ViewContext, viewController: ViewController, viewHelper: IPointerHandlerHelper);
    private onTap;
    private onChange;
    private _dispatchGesture;
    protected _onMouseDown(e: EditorMouseEvent, pointerId: number): void;
}
export declare class PointerHandler extends Disposable {
    private readonly handler;
    constructor(context: ViewContext, viewController: ViewController, viewHelper: IPointerHandlerHelper);
    getTargetAtClientPoint(clientX: number, clientY: number): IMouseTarget | null;
}
