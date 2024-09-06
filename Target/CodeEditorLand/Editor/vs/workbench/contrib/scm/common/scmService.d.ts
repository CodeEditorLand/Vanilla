import { Event } from "vs/base/common/event";
import { Iterable } from "vs/base/common/iterator";
import { URI } from "vs/base/common/uri";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { ILogService } from "vs/platform/log/common/log";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { ISCMProvider, ISCMRepository, ISCMService } from "./scm";
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
