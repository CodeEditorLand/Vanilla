import type { Terminal as RawXtermTerminal } from "@xterm/xterm";
import { IFocusTracker } from "vs/base/browser/dom";
import { Disposable } from "vs/base/common/lifecycle";
import "vs/css!./media/terminalChatWidget";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { InlineChatWidget } from "vs/workbench/contrib/inlineChat/browser/inlineChatWidget";
import { ITerminalInstance, type IXtermTerminal } from "vs/workbench/contrib/terminal/browser/terminal";
export declare class TerminalChatWidget extends Disposable {
    private readonly _terminalElement;
    private readonly _instance;
    private readonly _xterm;
    private readonly _instantiationService;
    private readonly _contextKeyService;
    private readonly _container;
    private readonly _onDidHide;
    readonly onDidHide: any;
    private readonly _inlineChatWidget;
    get inlineChatWidget(): InlineChatWidget;
    private readonly _focusTracker;
    private readonly _focusedContextKey;
    private readonly _visibleContextKey;
    constructor(_terminalElement: HTMLElement, _instance: ITerminalInstance, _xterm: IXtermTerminal & {
        raw: RawXtermTerminal;
    }, _instantiationService: IInstantiationService, _contextKeyService: IContextKeyService);
    private _dimension?;
    private _relayout;
    private _doLayout;
    private _reset;
    reveal(): void;
    private _getTop;
    private _updateVerticalPosition;
    private _getTerminalWrapperHeight;
    hide(): void;
    private _setTerminalOffset;
    focus(): void;
    hasFocus(): boolean;
    input(): string;
    setValue(value?: string): void;
    acceptCommand(code: string, shouldExecute: boolean): void;
    get focusTracker(): IFocusTracker;
}
