import { Event } from "vs/base/common/event";
import { URI } from "vs/base/common/uri";
/**
 * Mime type used by the output editor.
 */
export declare const OUTPUT_MIME = "text/x-code-output";
/**
 * Id used by the output editor.
 */
export declare const OUTPUT_MODE_ID = "Log";
/**
 * Mime type used by the log output editor.
 */
export declare const LOG_MIME = "text/x-code-log-output";
/**
 * Id used by the log output editor.
 */
export declare const LOG_MODE_ID = "log";
/**
 * Output view id
 */
export declare const OUTPUT_VIEW_ID = "workbench.panel.output";
export declare const CONTEXT_IN_OUTPUT: any;
export declare const CONTEXT_ACTIVE_FILE_OUTPUT: any;
export declare const CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE: any;
export declare const CONTEXT_ACTIVE_OUTPUT_LEVEL: any;
export declare const CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT: any;
export declare const CONTEXT_OUTPUT_SCROLL_LOCK: any;
export declare const IOutputService: any;
/**
 * The output service to manage output from the various processes running.
 */
export interface IOutputService {
    readonly _serviceBrand: undefined;
    /**
     * Given the channel id returns the output channel instance.
     * Channel should be first registered via OutputChannelRegistry.
     */
    getChannel(id: string): IOutputChannel | undefined;
    /**
     * Given the channel id returns the registered output channel descriptor.
     */
    getChannelDescriptor(id: string): IOutputChannelDescriptor | undefined;
    /**
     * Returns an array of all known output channels descriptors.
     */
    getChannelDescriptors(): IOutputChannelDescriptor[];
    /**
     * Returns the currently active channel.
     * Only one channel can be active at a given moment.
     */
    getActiveChannel(): IOutputChannel | undefined;
    /**
     * Show the channel with the passed id.
     */
    showChannel(id: string, preserveFocus?: boolean): Promise<void>;
    /**
     * Allows to register on active output channel change.
     */
    onActiveOutputChannel: Event<string>;
}
export declare enum OutputChannelUpdateMode {
    Append = 1,
    Replace = 2,
    Clear = 3
}
export interface IOutputChannel {
    /**
     * Identifier of the output channel.
     */
    id: string;
    /**
     * Label of the output channel to be displayed to the user.
     */
    label: string;
    /**
     * URI of the output channel.
     */
    uri: URI;
    /**
     * Appends output to the channel.
     */
    append(output: string): void;
    /**
     * Clears all received output for this channel.
     */
    clear(): void;
    /**
     * Replaces the content of the channel with given output
     */
    replace(output: string): void;
    /**
     * Update the channel.
     */
    update(mode: OutputChannelUpdateMode.Append): void;
    update(mode: OutputChannelUpdateMode, till: number): void;
    /**
     * Disposes the output channel.
     */
    dispose(): void;
}
export declare const Extensions: {
    OutputChannels: string;
};
export interface IOutputChannelDescriptor {
    id: string;
    label: string;
    log: boolean;
    languageId?: string;
    file?: URI;
    extensionId?: string;
}
export interface IFileOutputChannelDescriptor extends IOutputChannelDescriptor {
    file: URI;
}
export interface IOutputChannelRegistry {
    readonly onDidRegisterChannel: Event<string>;
    readonly onDidRemoveChannel: Event<string>;
    /**
     * Make an output channel known to the output world.
     */
    registerChannel(descriptor: IOutputChannelDescriptor): void;
    /**
     * Returns the list of channels known to the output world.
     */
    getChannels(): IOutputChannelDescriptor[];
    /**
     * Returns the channel with the passed id.
     */
    getChannel(id: string): IOutputChannelDescriptor | undefined;
    /**
     * Remove the output channel with the passed id.
     */
    removeChannel(id: string): void;
}
export declare const ACTIVE_OUTPUT_CHANNEL_CONTEXT: any;
