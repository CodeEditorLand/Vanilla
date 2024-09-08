import * as pfs from "../../../../base/node/pfs.js";
import type { ITextQuery, ITextSearchStats } from "../common/search.js";
import type { TextSearchProviderNew } from "../common/searchExtTypes.js";
import { TextSearchManager } from "../common/textSearchManager.js";
export declare class NativeTextSearchManager extends TextSearchManager {
    constructor(query: ITextQuery, provider: TextSearchProviderNew, _pfs?: typeof pfs, processType?: ITextSearchStats["type"]);
}