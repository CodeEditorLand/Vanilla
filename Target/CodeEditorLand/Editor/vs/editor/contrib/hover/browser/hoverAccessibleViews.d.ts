import { IAction } from "vs/base/common/actions";
import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { ContentHoverController } from "vs/editor/contrib/hover/browser/contentHoverController2";
import { AccessibleContentProvider, IAccessibleViewContentProvider, IAccessibleViewOptions } from "vs/platform/accessibility/browser/accessibleView";
import { IAccessibleViewImplentation } from "vs/platform/accessibility/browser/accessibleViewRegistry";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
export declare class HoverAccessibleView implements IAccessibleViewImplentation {
    readonly type: any;
    readonly priority = 95;
    readonly name = "hover";
    readonly when: any;
    getProvider(accessor: ServicesAccessor): AccessibleContentProvider | undefined;
}
export declare class HoverAccessibilityHelp implements IAccessibleViewImplentation {
    readonly priority = 100;
    readonly name = "hover";
    readonly type: any;
    readonly when: any;
    getProvider(accessor: ServicesAccessor): AccessibleContentProvider | undefined;
}
declare abstract class BaseHoverAccessibleViewProvider extends Disposable implements IAccessibleViewContentProvider {
    protected readonly _hoverController: ContentHoverController;
    abstract provideContent(): string;
    abstract options: IAccessibleViewOptions;
    readonly id: any;
    readonly verbositySettingKey = "accessibility.verbosity.hover";
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<void>;
    protected _focusedHoverPartIndex: number;
    constructor(_hoverController: ContentHoverController);
    onOpen(): void;
    onClose(): void;
    provideContentAtIndex(focusedHoverIndex: number, includeVerbosityActions: boolean): string;
    private _descriptionsOfVerbosityActionsForIndex;
    private _descriptionOfVerbosityActionForIndex;
}
export declare class HoverAccessibilityHelpProvider extends BaseHoverAccessibleViewProvider implements IAccessibleViewContentProvider {
    readonly options: IAccessibleViewOptions;
    constructor(hoverController: ContentHoverController);
    provideContent(): string;
}
export declare class HoverAccessibleViewProvider extends BaseHoverAccessibleViewProvider implements IAccessibleViewContentProvider {
    private readonly _keybindingService;
    private readonly _editor;
    readonly options: IAccessibleViewOptions;
    constructor(_keybindingService: IKeybindingService, _editor: ICodeEditor, hoverController: ContentHoverController);
    provideContent(): string;
    get actions(): IAction[];
    private _getActionFor;
    private _initializeOptions;
}
export declare class ExtHoverAccessibleView implements IAccessibleViewImplentation {
    readonly type: any;
    readonly priority = 90;
    readonly name = "extension-hover";
    getProvider(accessor: ServicesAccessor): AccessibleContentProvider | undefined;
}
export {};
