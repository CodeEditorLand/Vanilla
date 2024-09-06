import { IDisposable } from "vs/base/common/lifecycle";
import { PerformanceMark } from "vs/base/common/performance";
import { URI } from "vs/base/common/uri";
import { LogLevel } from "vs/platform/log/common/log";
import { IProgress, IProgressCompositeOptions, IProgressDialogOptions, IProgressNotificationOptions, IProgressOptions, IProgressStep, IProgressWindowOptions } from "vs/platform/progress/common/progress";
import { ITunnel, ITunnelOptions, IWorkbenchConstructionOptions } from "vs/workbench/browser/web.api";
import { IEmbedderTerminalOptions } from "vs/workbench/services/terminal/common/embedderTerminalService";
/**
 * Creates the workbench with the provided options in the provided container.
 *
 * @param domElement the container to create the workbench in
 * @param options for setting up the workbench
 */
export declare function create(domElement: HTMLElement, options: IWorkbenchConstructionOptions): IDisposable;
export declare namespace commands {
    /**
     * {@linkcode IWorkbench.commands IWorkbench.commands.executeCommand}
     */
    function executeCommand(command: string, ...args: any[]): Promise<unknown>;
}
export declare namespace logger {
    /**
     * {@linkcode IWorkbench.logger IWorkbench.logger.log}
     */
    function log(level: LogLevel, message: string): void;
}
export declare namespace env {
    /**
     * {@linkcode IWorkbench.env IWorkbench.env.retrievePerformanceMarks}
     */
    function retrievePerformanceMarks(): Promise<[
        string,
        readonly PerformanceMark[]
    ][]>;
    /**
     * {@linkcode IWorkbench.env IWorkbench.env.getUriScheme}
     */
    function getUriScheme(): Promise<string>;
    /**
     * {@linkcode IWorkbench.env IWorkbench.env.openUri}
     */
    function openUri(target: URI): Promise<boolean>;
}
export declare namespace window {
    /**
     * {@linkcode IWorkbench.window IWorkbench.window.withProgress}
     */
    function withProgress<R>(options: IProgressOptions | IProgressDialogOptions | IProgressNotificationOptions | IProgressWindowOptions | IProgressCompositeOptions, task: (progress: IProgress<IProgressStep>) => Promise<R>): Promise<R>;
    function createTerminal(options: IEmbedderTerminalOptions): Promise<void>;
    function showInformationMessage<T extends string>(message: string, ...items: T[]): Promise<T | undefined>;
}
export declare namespace workspace {
    /**
     * {@linkcode IWorkbench.workspace IWorkbench.workspace.didResolveRemoteAuthority}
     */
    function didResolveRemoteAuthority(): Promise<void>;
    /**
     * {@linkcode IWorkbench.workspace IWorkbench.workspace.openTunnel}
     */
    function openTunnel(tunnelOptions: ITunnelOptions): Promise<ITunnel>;
}