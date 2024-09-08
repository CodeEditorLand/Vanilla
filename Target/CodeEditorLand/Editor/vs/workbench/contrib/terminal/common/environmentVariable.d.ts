import type { Event } from "../../../../base/common/event.js";
import type { EnvironmentVariableScope, IEnvironmentVariableCollection, IMergedEnvironmentVariableCollection } from "../../../../platform/terminal/common/environmentVariable.js";
import type { ITerminalStatus } from "./terminal.js";
export declare const IEnvironmentVariableService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IEnvironmentVariableService>;
/**
 * Tracks and persists environment variable collections as defined by extensions.
 */
export interface IEnvironmentVariableService {
    readonly _serviceBrand: undefined;
    /**
     * Gets a single collection constructed by merging all environment variable collections into
     * one.
     */
    readonly collections: ReadonlyMap<string, IEnvironmentVariableCollection>;
    /**
     * Gets a single collection constructed by merging all environment variable collections into
     * one.
     */
    readonly mergedCollection: IMergedEnvironmentVariableCollection;
    /**
     * An event that is fired when an extension's environment variable collection changes, the event
     * provides the new merged collection.
     */
    onDidChangeCollections: Event<IMergedEnvironmentVariableCollection>;
    /**
     * Sets an extension's environment variable collection.
     */
    set(extensionIdentifier: string, collection: IEnvironmentVariableCollection): void;
    /**
     * Deletes an extension's environment variable collection.
     */
    delete(extensionIdentifier: string): void;
}
export interface IEnvironmentVariableCollectionWithPersistence extends IEnvironmentVariableCollection {
    readonly persistent: boolean;
}
export interface IEnvironmentVariableInfo {
    readonly requiresAction: boolean;
    getStatus(scope: EnvironmentVariableScope | undefined): ITerminalStatus;
}
