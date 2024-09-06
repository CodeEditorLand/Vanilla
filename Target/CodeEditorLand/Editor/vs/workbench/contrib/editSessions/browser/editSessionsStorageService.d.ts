import { Disposable } from "vs/base/common/lifecycle";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IEnvironmentService } from "vs/platform/environment/common/environment";
import { IFileService } from "vs/platform/files/common/files";
import { IProductService } from "vs/platform/product/common/productService";
import { IQuickInputService } from "vs/platform/quickinput/common/quickInput";
import { ISecretStorageService } from "vs/platform/secrets/common/secrets";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IResourceRefHandle } from "vs/platform/userDataSync/common/userDataSync";
import { EditSession, IEditSessionsLogService, IEditSessionsStorageService, SyncResource } from "vs/workbench/contrib/editSessions/common/editSessions";
import { EditSessionsStoreClient } from "vs/workbench/contrib/editSessions/common/editSessionsStorageClient";
import { IAuthenticationService } from "vs/workbench/services/authentication/common/authentication";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
export declare class EditSessionsWorkbenchService extends Disposable implements IEditSessionsStorageService {
    private readonly fileService;
    private readonly storageService;
    private readonly quickInputService;
    private readonly authenticationService;
    private readonly extensionService;
    private readonly environmentService;
    private readonly logService;
    private readonly productService;
    private readonly contextKeyService;
    private readonly dialogService;
    private readonly secretStorageService;
    _serviceBrand: undefined;
    readonly SIZE_LIMIT: number;
    private serverConfiguration;
    private machineClient;
    private authenticationInfo;
    private static CACHED_SESSION_STORAGE_KEY;
    private initialized;
    private readonly signedInContext;
    get isSignedIn(): boolean;
    private _didSignIn;
    get onDidSignIn(): any;
    private _didSignOut;
    get onDidSignOut(): any;
    private _lastWrittenResources;
    get lastWrittenResources(): Map<SyncResource, {
        ref: string;
        content: string;
    }>;
    private _lastReadResources;
    get lastReadResources(): Map<SyncResource, {
        ref: string;
        content: string;
    }>;
    storeClient: EditSessionsStoreClient | undefined;
    constructor(fileService: IFileService, storageService: IStorageService, quickInputService: IQuickInputService, authenticationService: IAuthenticationService, extensionService: IExtensionService, environmentService: IEnvironmentService, logService: IEditSessionsLogService, productService: IProductService, contextKeyService: IContextKeyService, dialogService: IDialogService, secretStorageService: ISecretStorageService);
    /**
     * @param resource: The resource to retrieve content for.
     * @param content An object representing resource state to be restored.
     * @returns The ref of the stored state.
     */
    write(resource: SyncResource, content: string | EditSession): Promise<string>;
    /**
     * @param resource: The resource to retrieve content for.
     * @param ref: A specific content ref to retrieve content for, if it exists.
     * If undefined, this method will return the latest saved edit session, if any.
     *
     * @returns An object representing the requested or latest state, if any.
     */
    read(resource: SyncResource, ref: string | undefined): Promise<{
        ref: string;
        content: string;
    } | undefined>;
    delete(resource: SyncResource, ref: string | null): Promise<void>;
    list(resource: SyncResource): Promise<IResourceRefHandle[]>;
    initialize(reason: "read" | "write", silent?: boolean): Promise<boolean>;
    /**
     *
     * Ensures that the store client is initialized,
     * meaning that authentication is configured and it
     * can be used to communicate with the remote storage service
     */
    private doInitialize;
    private cachedMachines;
    getMachineById(machineId: string): Promise<string | undefined>;
    private getOrCreateCurrentMachineId;
    private getAuthenticationSession;
    private shouldAttemptEditSessionInit;
    /**
     *
     * Prompts the user to pick an authentication option for storing and getting edit sessions.
     */
    private getAccountPreference;
    private createQuickpickItems;
    /**
     *
     * Returns all authentication sessions available from {@link getAuthenticationProviders}.
     */
    private getAllSessions;
    /**
     *
     * Returns all authentication providers which can be used to authenticate
     * to the remote storage service, based on product.json configuration
     * and registered authentication providers.
     */
    private getAuthenticationProviders;
    private get existingSessionId();
    private set existingSessionId(value);
    private getExistingSession;
    private onDidChangeStorage;
    private clearAuthenticationPreference;
    private onDidChangeSessions;
    private registerSignInAction;
    private registerResetAuthenticationAction;
}
