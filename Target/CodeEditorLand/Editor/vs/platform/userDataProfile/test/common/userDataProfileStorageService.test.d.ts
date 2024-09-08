import { Event } from "../../../../base/common/event.js";
import { InMemoryStorageDatabase } from "../../../../base/parts/storage/common/storage.js";
import { type IUserDataProfile } from "../../common/userDataProfile.js";
import { AbstractUserDataProfileStorageService, type IUserDataProfileStorageService } from "../../common/userDataProfileStorageService.js";
export declare class TestUserDataProfileStorageService extends AbstractUserDataProfileStorageService implements IUserDataProfileStorageService {
    readonly onDidChange: Event<any>;
    private databases;
    protected createStorageDatabase(profile: IUserDataProfile): Promise<InMemoryStorageDatabase>;
    setupStorageDatabase(profile: IUserDataProfile): Promise<InMemoryStorageDatabase>;
}
