import { Disposable } from "vs/base/common/lifecycle";
import { OperatingSystem } from "vs/base/common/platform";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IMergedEnvironmentVariableCollection } from "vs/platform/terminal/common/environmentVariable";
import { ITerminalBackend } from "vs/platform/terminal/common/terminal";
import { IDetachedTerminalInstance, IDetachedXTermOptions, IDetachedXtermTerminal, ITerminalContribution, IXtermAttachToElementOptions } from "vs/workbench/contrib/terminal/browser/terminal";
import { XtermTerminal } from "vs/workbench/contrib/terminal/browser/xterm/xtermTerminal";
import { IEnvironmentVariableInfo } from "vs/workbench/contrib/terminal/common/environmentVariable";
import { ITerminalProcessInfo } from "vs/workbench/contrib/terminal/common/terminal";
export declare class DetachedTerminal extends Disposable implements IDetachedTerminalInstance {
    private readonly _xterm;
    private readonly _widgets;
    readonly capabilities: any;
    private readonly _contributions;
    domElement?: HTMLElement;
    get xterm(): IDetachedXtermTerminal;
    constructor(_xterm: XtermTerminal, options: IDetachedXTermOptions, instantiationService: IInstantiationService);
    get selection(): string | undefined;
    hasSelection(): boolean;
    clearSelection(): void;
    focus(force?: boolean): void;
    attachToElement(container: HTMLElement, options?: Partial<IXtermAttachToElementOptions> | undefined): void;
    forceScrollbarVisibility(): void;
    resetScrollbarVisibility(): void;
    getContribution<T extends ITerminalContribution>(id: string): T | null;
}
/**
 * Implements {@link ITerminalProcessInfo} for a detached terminal where most
 * properties are stubbed. Properties are mutable and can be updated by
 * the instantiator.
 */
export declare class DetachedProcessInfo implements ITerminalProcessInfo {
    processState: any;
    ptyProcessReady: Promise<void>;
    shellProcessId: number | undefined;
    remoteAuthority: string | undefined;
    os: OperatingSystem | undefined;
    userHome: string | undefined;
    initialCwd: string;
    environmentVariableInfo: IEnvironmentVariableInfo | undefined;
    persistentProcessId: number | undefined;
    shouldPersist: boolean;
    hasWrittenData: boolean;
    hasChildProcesses: boolean;
    backend: ITerminalBackend | undefined;
    capabilities: any;
    shellIntegrationNonce: string;
    extEnvironmentVariableCollection: IMergedEnvironmentVariableCollection | undefined;
    constructor(initialValues: Partial<ITerminalProcessInfo>);
}
