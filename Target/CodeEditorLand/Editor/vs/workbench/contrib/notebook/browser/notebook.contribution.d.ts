import { Disposable } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IUndoRedoService } from "../../../../platform/undoRedo/common/undoRedo.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import "./controller/coreActions.js";
import "./controller/insertCellActions.js";
import "./controller/executeActions.js";
import "./controller/sectionActions.js";
import "./controller/layoutActions.js";
import "./controller/editActions.js";
import "./controller/cellOutputActions.js";
import "./controller/apiActions.js";
import "./controller/foldingController.js";
import "./controller/chat/notebook.chat.contribution.js";
import "./contrib/editorHint/emptyCellEditorHint.js";
import "./contrib/clipboard/notebookClipboard.js";
import "./contrib/find/notebookFind.js";
import "./contrib/format/formatting.js";
import "./contrib/saveParticipants/saveParticipants.js";
import "./contrib/gettingStarted/notebookGettingStarted.js";
import "./contrib/layout/layoutActions.js";
import "./contrib/marker/markerProvider.js";
import "./contrib/navigation/arrow.js";
import "./contrib/outline/notebookOutline.js";
import "./contrib/profile/notebookProfile.js";
import "./contrib/cellStatusBar/statusBarProviders.js";
import "./contrib/cellStatusBar/contributedStatusBarItemController.js";
import "./contrib/cellStatusBar/executionStatusBarItemController.js";
import "./contrib/editorStatusBar/editorStatusBar.js";
import "./contrib/undoRedo/notebookUndoRedo.js";
import "./contrib/cellCommands/cellCommands.js";
import "./contrib/viewportWarmup/viewportWarmup.js";
import "./contrib/troubleshoot/layout.js";
import "./contrib/debug/notebookBreakpoints.js";
import "./contrib/debug/notebookCellPausing.js";
import "./contrib/debug/notebookDebugDecorations.js";
import "./contrib/execute/executionEditorProgress.js";
import "./contrib/kernelDetection/notebookKernelDetection.js";
import "./contrib/cellDiagnostics/cellDiagnostics.js";
import "./contrib/multicursor/notebookMulticursor.js";
import "./diff/notebookDiffActions.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
export declare class NotebookContribution extends Disposable implements IWorkbenchContribution {
    private readonly codeEditorService;
    static readonly ID = "workbench.contrib.notebook";
    private _uriComparisonKeyComputer?;
    constructor(undoRedoService: IUndoRedoService, configurationService: IConfigurationService, codeEditorService: ICodeEditorService);
    private updateCellUndoRedoComparisonKey;
    private static _getCellUndoRedoComparisonKey;
    dispose(): void;
}
