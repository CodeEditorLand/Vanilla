import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import type { ExtensionKind } from "../../../../platform/environment/common/environment.js";
import { ExtensionIdentifierMap, type ExtensionIdentifier, type IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import type { IReadOnlyExtensionDescriptionRegistry } from "./extensionDescriptionRegistry.js";
import { ExtensionHostKind, type IExtensionHostKindPicker } from "./extensionHostKind.js";
import type { IExtensionHostManager } from "./extensionHostManagers.js";
import { IExtensionManifestPropertiesService } from "./extensionManifestPropertiesService.js";
import { type ExtensionRunningLocation } from "./extensionRunningLocation.js";
export declare class ExtensionRunningLocationTracker {
    private readonly _registry;
    private readonly _extensionHostKindPicker;
    private readonly _environmentService;
    private readonly _configurationService;
    private readonly _logService;
    private readonly _extensionManifestPropertiesService;
    private _runningLocation;
    private _maxLocalProcessAffinity;
    private _maxLocalWebWorkerAffinity;
    get maxLocalProcessAffinity(): number;
    get maxLocalWebWorkerAffinity(): number;
    constructor(_registry: IReadOnlyExtensionDescriptionRegistry, _extensionHostKindPicker: IExtensionHostKindPicker, _environmentService: IWorkbenchEnvironmentService, _configurationService: IConfigurationService, _logService: ILogService, _extensionManifestPropertiesService: IExtensionManifestPropertiesService);
    set(extensionId: ExtensionIdentifier, runningLocation: ExtensionRunningLocation): void;
    readExtensionKinds(extensionDescription: IExtensionDescription): ExtensionKind[];
    getRunningLocation(extensionId: ExtensionIdentifier): ExtensionRunningLocation | null;
    filterByRunningLocation(extensions: readonly IExtensionDescription[], desiredRunningLocation: ExtensionRunningLocation): IExtensionDescription[];
    filterByExtensionHostKind(extensions: readonly IExtensionDescription[], desiredExtensionHostKind: ExtensionHostKind): IExtensionDescription[];
    filterByExtensionHostManager(extensions: readonly IExtensionDescription[], extensionHostManager: IExtensionHostManager): IExtensionDescription[];
    private _computeAffinity;
    computeRunningLocation(localExtensions: IExtensionDescription[], remoteExtensions: IExtensionDescription[], isInitialAllocation: boolean): ExtensionIdentifierMap<ExtensionRunningLocation | null>;
    private _doComputeRunningLocation;
    initializeRunningLocation(localExtensions: IExtensionDescription[], remoteExtensions: IExtensionDescription[]): void;
    /**
     * Returns the running locations for the removed extensions.
     */
    deltaExtensions(toAdd: IExtensionDescription[], toRemove: ExtensionIdentifier[]): ExtensionIdentifierMap<ExtensionRunningLocation | null>;
    /**
     * Update `this._runningLocation` with running locations for newly enabled/installed extensions.
     */
    private _updateRunningLocationForAddedExtensions;
}
export declare function filterExtensionDescriptions(extensions: readonly IExtensionDescription[], runningLocation: ExtensionIdentifierMap<ExtensionRunningLocation | null>, predicate: (extRunningLocation: ExtensionRunningLocation) => boolean): IExtensionDescription[];
export declare function filterExtensionIdentifiers(extensions: readonly ExtensionIdentifier[], runningLocation: ExtensionIdentifierMap<ExtensionRunningLocation | null>, predicate: (extRunningLocation: ExtensionRunningLocation) => boolean): ExtensionIdentifier[];
