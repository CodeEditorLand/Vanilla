import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IUndoRedoService } from "vs/platform/undoRedo/common/undoRedo";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import "vs/workbench/contrib/notebook/browser/controller/coreActions";
import "vs/workbench/contrib/notebook/browser/controller/insertCellActions";
import "vs/workbench/contrib/notebook/browser/controller/executeActions";
import "vs/workbench/contrib/notebook/browser/controller/sectionActions";
import "vs/workbench/contrib/notebook/browser/controller/layoutActions";
import "vs/workbench/contrib/notebook/browser/controller/editActions";
import "vs/workbench/contrib/notebook/browser/controller/cellOutputActions";
import "vs/workbench/contrib/notebook/browser/controller/apiActions";
import "vs/workbench/contrib/notebook/browser/controller/foldingController";
import "vs/workbench/contrib/notebook/browser/controller/chat/notebook.chat.contribution";
import "vs/workbench/contrib/notebook/browser/contrib/editorHint/emptyCellEditorHint";
import "vs/workbench/contrib/notebook/browser/contrib/clipboard/notebookClipboard";
import "vs/workbench/contrib/notebook/browser/contrib/find/notebookFind";
import "vs/workbench/contrib/notebook/browser/contrib/format/formatting";
import "vs/workbench/contrib/notebook/browser/contrib/saveParticipants/saveParticipants";
import "vs/workbench/contrib/notebook/browser/contrib/gettingStarted/notebookGettingStarted";
import "vs/workbench/contrib/notebook/browser/contrib/layout/layoutActions";
import "vs/workbench/contrib/notebook/browser/contrib/marker/markerProvider";
import "vs/workbench/contrib/notebook/browser/contrib/navigation/arrow";
import "vs/workbench/contrib/notebook/browser/contrib/outline/notebookOutline";
import "vs/workbench/contrib/notebook/browser/contrib/profile/notebookProfile";
import "vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/statusBarProviders";
import "vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/contributedStatusBarItemController";
import "vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/executionStatusBarItemController";
import "vs/workbench/contrib/notebook/browser/contrib/editorStatusBar/editorStatusBar";
import "vs/workbench/contrib/notebook/browser/contrib/undoRedo/notebookUndoRedo";
import "vs/workbench/contrib/notebook/browser/contrib/cellCommands/cellCommands";
import "vs/workbench/contrib/notebook/browser/contrib/viewportWarmup/viewportWarmup";
import "vs/workbench/contrib/notebook/browser/contrib/troubleshoot/layout";
import "vs/workbench/contrib/notebook/browser/contrib/debug/notebookBreakpoints";
import "vs/workbench/contrib/notebook/browser/contrib/debug/notebookCellPausing";
import "vs/workbench/contrib/notebook/browser/contrib/debug/notebookDebugDecorations";
import "vs/workbench/contrib/notebook/browser/contrib/execute/executionEditorProgress";
import "vs/workbench/contrib/notebook/browser/contrib/kernelDetection/notebookKernelDetection";
import "vs/workbench/contrib/notebook/browser/contrib/cellDiagnostics/cellDiagnostics";
import "vs/workbench/contrib/notebook/browser/contrib/multicursor/notebookMulticursor";
import "vs/workbench/contrib/notebook/browser/diff/notebookDiffActions";
import { ICodeEditorService } from "vs/editor/browser/services/codeEditorService";
export declare class NotebookContribution extends Disposable implements IWorkbenchContribution {
    private readonly codeEditorService;
    static readonly ID = "workbench.contrib.notebook";
    private _uriComparisonKeyComputer?;
    constructor(undoRedoService: IUndoRedoService, configurationService: IConfigurationService, codeEditorService: ICodeEditorService);
    private updateCellUndoRedoComparisonKey;
    private static _getCellUndoRedoComparisonKey;
    dispose(): void;
}