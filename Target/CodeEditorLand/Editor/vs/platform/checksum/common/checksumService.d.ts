import { URI } from "vs/base/common/uri";
export declare const IChecksumService: any;
export interface IChecksumService {
    readonly _serviceBrand: undefined;
    /**
     * Computes the checksum of the contents of the resource.
     */
    checksum(resource: URI): Promise<string>;
}
