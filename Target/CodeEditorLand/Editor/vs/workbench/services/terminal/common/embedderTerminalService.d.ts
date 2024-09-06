import { Event } from "vs/base/common/event";
import { IShellLaunchConfig } from "vs/platform/terminal/common/terminal";
export declare const IEmbedderTerminalService: any;
/**
 * Manages terminals that the embedder can create before the terminal contrib is available.
 */
export interface IEmbedderTerminalService {
    readonly _serviceBrand: undefined;
    readonly onDidCreateTerminal: Event<IShellLaunchConfig>;
    createTerminal(options: IEmbedderTerminalOptions): void;
}
export type EmbedderTerminal = IShellLaunchConfig & Required<Pick<IShellLaunchConfig, "customPtyImplementation">>;
export interface IEmbedderTerminalOptions {
    name: string;
    pty: IEmbedderTerminalPty;
}
/**
 * See Pseudoterminal on the vscode API for usage.
 */
export interface IEmbedderTerminalPty {
    onDidWrite: Event<string>;
    onDidClose?: Event<void | number>;
    onDidChangeName?: Event<string>;
    open(): void;
    close(): void;
}
