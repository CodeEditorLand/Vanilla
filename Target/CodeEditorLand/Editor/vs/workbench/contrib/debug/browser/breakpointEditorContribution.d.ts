import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { Range } from "vs/editor/common/core/range";
import { IModelDecorationOptions, ITextModel } from "vs/editor/common/model";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { ILabelService } from "vs/platform/label/common/label";
import { BreakpointWidgetContext, IBreakpoint, IBreakpointEditorContribution, IDebugService, State } from "vs/workbench/contrib/debug/common/debug";
export declare function createBreakpointDecorations(accessor: ServicesAccessor, model: ITextModel, breakpoints: ReadonlyArray<IBreakpoint>, state: State, breakpointsActivated: boolean, showBreakpointsInOverviewRuler: boolean): {
    range: Range;
    options: IModelDecorationOptions;
}[];
export declare class BreakpointEditorContribution implements IBreakpointEditorContribution {
    private readonly editor;
    private readonly debugService;
    private readonly contextMenuService;
    private readonly instantiationService;
    private readonly dialogService;
    private readonly configurationService;
    private readonly labelService;
    private breakpointHintDecoration;
    private breakpointWidget;
    private breakpointWidgetVisible;
    private toDispose;
    private ignoreDecorationsChangedEvent;
    private ignoreBreakpointsChangeEvent;
    private breakpointDecorations;
    private candidateDecorations;
    private setDecorationsScheduler;
    constructor(editor: ICodeEditor, debugService: IDebugService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, dialogService: IDialogService, configurationService: IConfigurationService, labelService: ILabelService);
    /**
     * Returns context menu actions at the line number if breakpoints can be
     * set. This is used by the {@link TestingDecorations} to allow breakpoint
     * setting on lines where breakpoint "run" actions are present.
     */
    getContextMenuActionsAtPosition(lineNumber: number, model: ITextModel): IAction[];
    private registerListeners;
    private getContextMenuActions;
    private marginFreeFromNonDebugDecorations;
    private ensureBreakpointHintDecoration;
    private setDecorations;
    private onModelDecorationsChanged;
    showBreakpointWidget(lineNumber: number, column: number | undefined, context?: BreakpointWidgetContext): void;
    closeBreakpointWidget(): void;
    dispose(): void;
}
export declare const debugIconBreakpointForeground: any;
