import { IAction } from "../../../../base/common/actions.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { Range } from "../../../../editor/common/core/range.js";
import { IModelDecorationOptions, ITextModel } from "../../../../editor/common/model.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { BreakpointWidgetContext, IBreakpoint, IBreakpointEditorContribution, IDebugService, State } from "../common/debug.js";
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
export declare const debugIconBreakpointForeground: string;
