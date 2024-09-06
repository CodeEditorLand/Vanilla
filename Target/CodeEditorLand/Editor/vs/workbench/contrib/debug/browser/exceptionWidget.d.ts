import "vs/css!./media/exceptionWidget";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { ZoneWidget } from "vs/editor/contrib/zoneWidget/browser/zoneWidget";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IDebugSession, IExceptionInfo } from "vs/workbench/contrib/debug/common/debug";
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
