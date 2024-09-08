import { type Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { type ISCMProvider, type ISCMRepository, type ISCMService } from "./scm.js";
export declare class SCMService implements ISCMService {
    private readonly logService;
    private readonly uriIdentityService;
    readonly _serviceBrand: undefined;
    _repositories: Map<string, ISCMRepository>;
    get repositories(): Iterable<ISCMRepository>;
    get repositoryCount(): number;
    private inputHistory;
    private providerCount;
    private readonly _onDidAddProvider;
    readonly onDidAddRepository: Event<ISCMRepository>;
    private readonly _onDidRemoveProvider;
    readonly onDidRemoveRepository: Event<ISCMRepository>;
    constructor(logService: ILogService, workspaceContextService: IWorkspaceContextService, contextKeyService: IContextKeyService, storageService: IStorageService, uriIdentityService: IUriIdentityService);
    registerSCMProvider(provider: ISCMProvider): ISCMRepository;
    getRepository(id: string): ISCMRepository | undefined;
    getRepository(resource: URI): ISCMRepository | undefined;
}
