import "./media/exceptionWidget.css";
import type { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { ZoneWidget } from "../../../../editor/contrib/zoneWidget/browser/zoneWidget.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { type IDebugSession, type IExceptionInfo } from "../common/debug.js";
export declare class ExceptionWidget extends ZoneWidget {
    private exceptionInfo;
    private debugSession;
    private readonly instantiationService;
    private backgroundColor;
    constructor(editor: ICodeEditor, exceptionInfo: IExceptionInfo, debugSession: IDebugSession | undefined, themeService: IThemeService, instantiationService: IInstantiationService);
    private applyTheme;
    protected _applyStyles(): void;
    protected _fillContainer(container: HTMLElement): void;
    protected _doLayout(_heightInPixel: number | undefined, _widthInPixel: number | undefined): void;
    focus(): void;
    hasFocus(): boolean;
}
