import { Action } from "vs/base/common/actions";
import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IAction2Options } from "vs/platform/actions/common/actions";
import { ICommandService } from "vs/platform/commands/common/commands";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { Severity } from "vs/platform/notification/common/notification";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { ITerminalProfile } from "vs/platform/terminal/common/terminal";
import { IWorkspaceFolder } from "vs/platform/workspace/common/workspace";
import { IDetachedTerminalInstance, ITerminalConfigurationService, ITerminalEditorService, ITerminalGroupService, ITerminalInstance, ITerminalInstanceService, ITerminalService, IXtermTerminal } from "vs/workbench/contrib/terminal/browser/terminal";
import { ITerminalProfileResolverService, ITerminalProfileService } from "vs/workbench/contrib/terminal/common/terminal";
export declare const switchTerminalActionViewItemSeparator = "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500";
export declare const switchTerminalShowTabsTitle: any;
export interface WorkspaceFolderCwdPair {
    folder: IWorkspaceFolder;
    cwd: URI;
    isAbsolute: boolean;
    isOverridden: boolean;
}
export declare function getCwdForSplit(instance: ITerminalInstance, folders: IWorkspaceFolder[] | undefined, commandService: ICommandService, configService: ITerminalConfigurationService): Promise<string | URI | undefined>;
export declare const terminalSendSequenceCommand: (accessor: ServicesAccessor, args: unknown) => Promise<void>;
export declare class TerminalLaunchHelpAction extends Action {
    private readonly _openerService;
    constructor(_openerService: IOpenerService);
    run(): Promise<void>;
}
/**
 * A wrapper function around registerAction2 to help make registering terminal actions more concise.
 * The following default options are used if undefined:
 *
 * - `f1`: true
 * - `category`: Terminal
 * - `precondition`: TerminalContextKeys.processSupported
 */
export declare function registerTerminalAction(options: IAction2Options & {
    run: (c: ITerminalServicesCollection, accessor: ServicesAccessor, args?: unknown, args2?: unknown) => void | Promise<unknown>;
}): IDisposable;
/**
 * A wrapper around {@link registerTerminalAction} that runs a callback for all currently selected
 * instances provided in the action context. This falls back to the active instance if there are no
 * contextual instances provided.
 */
export declare function registerContextualInstanceAction(options: IAction2Options & {
    /**
     * When specified, only this type of active instance will be used when there are no
     * contextual instances.
     */
    activeInstanceType?: "view" | "editor";
    run: (instance: ITerminalInstance, c: ITerminalServicesCollection, accessor: ServicesAccessor, args?: unknown) => void | Promise<unknown>;
    /**
     * A callback to run after the the `run` callbacks have completed.
     * @param instances The selected instance(s) that the command was run on.
     */
    runAfter?: (instances: ITerminalInstance[], c: ITerminalServicesCollection, accessor: ServicesAccessor, args?: unknown) => void | Promise<unknown>;
}): IDisposable;
/**
 * A wrapper around {@link registerTerminalAction} that ensures an active instance exists and
 * provides it to the run function.
 */
export declare function registerActiveInstanceAction(options: IAction2Options & {
    run: (activeInstance: ITerminalInstance, c: ITerminalServicesCollection, accessor: ServicesAccessor, args?: unknown) => void | Promise<unknown>;
}): IDisposable;
/**
 * A wrapper around {@link registerTerminalAction} that ensures an active terminal
 * exists and provides it to the run function.
 *
 * This includes detached xterm terminals that are not managed by an {@link ITerminalInstance}.
 */
export declare function registerActiveXtermAction(options: IAction2Options & {
    run: (activeTerminal: IXtermTerminal, accessor: ServicesAccessor, instance: ITerminalInstance | IDetachedTerminalInstance, args?: unknown) => void | Promise<unknown>;
}): IDisposable;
export interface ITerminalServicesCollection {
    service: ITerminalService;
    configService: ITerminalConfigurationService;
    groupService: ITerminalGroupService;
    instanceService: ITerminalInstanceService;
    editorService: ITerminalEditorService;
    profileService: ITerminalProfileService;
    profileResolverService: ITerminalProfileResolverService;
}
export declare function registerTerminalActions(): void;
export declare function validateTerminalName(name: string): {
    content: string;
    severity: Severity;
} | null;
export declare function refreshTerminalActions(detectedProfiles: ITerminalProfile[]): IDisposable;
/**
 * Drops repeated CWDs, if any, by keeping the one which best matches the workspace folder. It also preserves the original order.
 */
export declare function shrinkWorkspaceFolderCwdPairs(pairs: WorkspaceFolderCwdPair[]): WorkspaceFolderCwdPair[];