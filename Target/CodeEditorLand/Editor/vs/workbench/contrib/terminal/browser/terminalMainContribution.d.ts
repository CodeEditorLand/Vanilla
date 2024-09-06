import { Disposable } from "vs/base/common/lifecycle";
import { ILabelService } from "vs/platform/label/common/label";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { ITerminalEditorService, ITerminalGroupService, ITerminalInstanceService, ITerminalService } from "vs/workbench/contrib/terminal/browser/terminal";
import { IEditorResolverService } from "vs/workbench/services/editor/common/editorResolverService";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle";
import { IEmbedderTerminalService } from "vs/workbench/services/terminal/common/embedderTerminalService";
/**
 * The main contribution for the terminal contrib. This contains calls to other components necessary
 * to set up the terminal but don't need to be tracked in the long term (where TerminalService would
 * be more relevant).
 */
export declare class TerminalMainContribution extends Disposable implements IWorkbenchContribution {
    static ID: string;
    constructor(editorResolverService: IEditorResolverService, embedderTerminalService: IEmbedderTerminalService, workbenchEnvironmentService: IWorkbenchEnvironmentService, labelService: ILabelService, lifecycleService: ILifecycleService, terminalService: ITerminalService, terminalEditorService: ITerminalEditorService, terminalGroupService: ITerminalGroupService, terminalInstanceService: ITerminalInstanceService);
    private _init;
}
