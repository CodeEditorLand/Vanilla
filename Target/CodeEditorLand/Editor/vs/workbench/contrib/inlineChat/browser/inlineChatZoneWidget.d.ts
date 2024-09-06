import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { EditorLayoutInfo } from "vs/editor/common/config/editorOptions";
import { Position } from "vs/editor/common/core/position";
import { Range } from "vs/editor/common/core/range";
import { ZoneWidget } from "vs/editor/contrib/zoneWidget/browser/zoneWidget";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IChatWidgetLocationOptions } from "vs/workbench/contrib/chat/browser/chatWidget";
import { EditorBasedInlineChatWidget } from "./inlineChatWidget";
export declare class InlineChatZoneWidget extends ZoneWidget {
    private readonly _instaService;
    private _logService;
    readonly widget: EditorBasedInlineChatWidget;
    private readonly _ctxCursorPosition;
    private _dimension?;
    constructor(location: IChatWidgetLocationOptions, editor: ICodeEditor, _instaService: IInstantiationService, _logService: ILogService, contextKeyService: IContextKeyService, configurationService: IConfigurationService);
    protected _fillContainer(container: HTMLElement): void;
    protected _doLayout(heightInPixel: number): void;
    private _computeHeight;
    protected _onWidth(_widthInPixel: number): void;
    show(position: Position): void;
    updatePositionAndHeight(position: Position): void;
    private _createZoneAndScrollRestoreFn;
    protected revealRange(range: Range, isLastLine: boolean): void;
    protected _getWidth(info: EditorLayoutInfo): number;
    hide(): void;
}
