import type { URI } from "../../../../../base/common/uri.js";
import type { IJSONEditingService, IJSONValue } from "../../common/jsonEditing.js";
export declare class TestJSONEditingService implements IJSONEditingService {
    _serviceBrand: any;
    write(resource: URI, values: IJSONValue[], save: boolean): Promise<void>;
}