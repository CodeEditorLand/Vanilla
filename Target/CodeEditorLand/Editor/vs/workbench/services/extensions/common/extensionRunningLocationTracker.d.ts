import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ExtensionKind } from "vs/platform/environment/common/environment";
import { ExtensionIdentifier, ExtensionIdentifierMap, IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { ILogService } from "vs/platform/log/common/log";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IReadOnlyExtensionDescriptionRegistry } from "vs/workbench/services/extensions/common/extensionDescriptionRegistry";
import { ExtensionHostKind, IExtensionHostKindPicker } from "vs/workbench/services/extensions/common/extensionHostKind";
import { IExtensionHostManager } from "vs/workbench/services/extensions/common/extensionHostManagers";
import { IExtensionManifestPropertiesService } from "vs/workbench/services/extensions/common/extensionManifestPropertiesService";
import { ExtensionRunningLocation } from "vs/workbench/services/extensions/common/extensionRunningLocation";
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
