import { IMouseEvent } from "vs/base/browser/mouseEvent";
import { ActionBar, IActionBarOptions } from "vs/base/browser/ui/actionbar/actionbar";
import { Color } from "vs/base/common/color";
import "vs/css!./media/peekViewWidget";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IOptions, IStyles, ZoneWidget } from "vs/editor/contrib/zoneWidget/browser/zoneWidget";
import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
export declare const IPeekViewService: any;
export interface IPeekViewService {
    readonly _serviceBrand: undefined;
    addExclusiveWidget(editor: ICodeEditor, widget: PeekViewWidget): void;
}
export declare namespace PeekContext {
    const inPeekEditor: any;
    const notInPeekEditor: any;
}
export declare function getOuterEditor(accessor: ServicesAccessor): ICodeEditor | null;
export interface IPeekViewStyles extends IStyles {
    headerBackgroundColor?: Color;
    primaryHeadingColor?: Color;
    secondaryHeadingColor?: Color;
}
export type IPeekViewOptions = IOptions & IPeekViewStyles & {
    supportOnTitleClick?: boolean;
};
export declare abstract class PeekViewWidget extends ZoneWidget {
    protected readonly instantiationService: IInstantiationService;
    readonly _serviceBrand: undefined;
    private readonly _onDidClose;
    readonly onDidClose: any;
    private disposed?;
    protected _headElement?: HTMLDivElement;
    protected _titleElement?: HTMLDivElement;
    protected _primaryHeading?: HTMLElement;
    protected _secondaryHeading?: HTMLElement;
    protected _metaHeading?: HTMLElement;
    protected _actionbarWidget?: ActionBar;
    protected _bodyElement?: HTMLDivElement;
    constructor(editor: ICodeEditor, options: IPeekViewOptions, instantiationService: IInstantiationService);
    dispose(): void;
    style(styles: IPeekViewStyles): void;
    protected _applyStyles(): void;
    protected _fillContainer(container: HTMLElement): void;
    protected _fillHead(container: HTMLElement, noCloseAction?: boolean): void;
    protected _fillTitleIcon(container: HTMLElement): void;
    protected _getActionBarOptions(): IActionBarOptions;
    protected _onTitleClick(event: IMouseEvent): void;
    setTitle(primaryHeading: string, secondaryHeading?: string): void;
    setMetaTitle(value: string): void;
    protected abstract _fillBody(container: HTMLElement): void;
    protected _doLayout(heightInPixel: number, widthInPixel: number): void;
    protected _doLayoutHead(heightInPixel: number, widthInPixel: number): void;
    protected _doLayoutBody(heightInPixel: number, widthInPixel: number): void;
}
export declare const peekViewTitleBackground: any;
export declare const peekViewTitleForeground: any;
export declare const peekViewTitleInfoForeground: any;
export declare const peekViewBorder: any;
export declare const peekViewResultsBackground: any;
export declare const peekViewResultsMatchForeground: any;
export declare const peekViewResultsFileForeground: any;
export declare const peekViewResultsSelectionBackground: any;
export declare const peekViewResultsSelectionForeground: any;
export declare const peekViewEditorBackground: any;
export declare const peekViewEditorGutterBackground: any;
export declare const peekViewEditorStickyScrollBackground: any;
export declare const peekViewResultsMatchHighlight: any;
export declare const peekViewEditorMatchHighlight: any;
export declare const peekViewEditorMatchHighlightBorder: any;
