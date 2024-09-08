import { type IExtUri } from "../../../base/common/resources.js";
import type { URI } from "../../../base/common/uri.js";
import { IFileService } from "../../files/common/files.js";
import { IUriIdentityService } from "./uriIdentity.js";
export declare class UriIdentityService implements IUriIdentityService {
    private readonly _fileService;
    readonly _serviceBrand: undefined;
    readonly extUri: IExtUri;
    private readonly _dispooables;
    private readonly _canonicalUris;
    private readonly _limit;
    constructor(_fileService: IFileService);
    dispose(): void;
    asCanonicalUri(uri: URI): URI;
    private _checkTrim;
}
