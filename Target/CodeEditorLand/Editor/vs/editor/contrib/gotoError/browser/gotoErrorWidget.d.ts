import { Event } from "vs/base/common/event";
import "vs/css!./media/gotoErrorWidget";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { PeekViewWidget } from "vs/editor/contrib/peekView/browser/peekView";
import { IMenuService } from "vs/platform/actions/common/actions";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILabelService } from "vs/platform/label/common/label";
import { IMarker, IRelatedInformation } from "vs/platform/markers/common/markers";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IThemeService } from "vs/platform/theme/common/themeService";
export declare class MarkerNavigationWidget extends PeekViewWidget {
    private readonly _themeService;
    private readonly _openerService;
    private readonly _menuService;
    private readonly _contextKeyService;
    private readonly _labelService;
    static readonly TitleMenu: any;
    private _parentContainer;
    private _container;
    private _icon;
    private _message;
    private readonly _callOnDispose;
    private _severity;
    private _backgroundColor?;
    private readonly _onDidSelectRelatedInformation;
    private _heightInPixel;
    readonly onDidSelectRelatedInformation: Event<IRelatedInformation>;
    constructor(editor: ICodeEditor, _themeService: IThemeService, _openerService: IOpenerService, _menuService: IMenuService, instantiationService: IInstantiationService, _contextKeyService: IContextKeyService, _labelService: ILabelService);
    private _applyTheme;
    protected _applyStyles(): void;
    dispose(): void;
    focus(): void;
    protected _fillHead(container: HTMLElement): void;
    protected _fillTitleIcon(container: HTMLElement): void;
    protected _fillBody(container: HTMLElement): void;
    show(): void;
    showAtMarker(marker: IMarker, markerIdx: number, markerCount: number): void;
    updateMarker(marker: IMarker): void;
    showStale(): void;
    protected _doLayoutBody(heightInPixel: number, widthInPixel: number): void;
    protected _onWidth(widthInPixel: number): void;
    protected _relayout(): void;
    private computeRequiredHeight;
}
