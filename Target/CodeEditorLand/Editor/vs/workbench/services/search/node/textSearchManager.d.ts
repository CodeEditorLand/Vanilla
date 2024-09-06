import * as pfs from "vs/base/node/pfs";
import { ITextQuery, ITextSearchStats } from "vs/workbench/services/search/common/search";
import { TextSearchProviderNew } from "vs/workbench/services/search/common/searchExtTypes";
import { TextSearchManager } from "vs/workbench/services/search/common/textSearchManager";
export declare class NativeTextSearchManager extends TextSearchManager {
    constructor(query: ITextQuery, provider: TextSearchProviderNew, _pfs?: typeof pfs, processType?: ITextSearchStats["type"]);
}
