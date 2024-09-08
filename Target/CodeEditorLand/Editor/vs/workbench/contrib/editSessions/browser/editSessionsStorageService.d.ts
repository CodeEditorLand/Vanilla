import { Disposable } from '../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IResourceRefHandle } from '../../../../platform/userDataSync/common/userDataSync.js';
import { IAuthenticationService } from '../../../services/authentication/common/authentication.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { EditSession, IEditSessionsStorageService, IEditSessionsLogService, SyncResource } from '../common/editSessions.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { EditSessionsStoreClient } from '../common/editSessionsStorageClient.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
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
    get onDidSignIn(): import("../../../../base/common/event.js").Event<void>;
    private _didSignOut;
    get onDidSignOut(): import("../../../../base/common/event.js").Event<void>;
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
    initialize(reason: 'read' | 'write', silent?: boolean): Promise<boolean>;
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
