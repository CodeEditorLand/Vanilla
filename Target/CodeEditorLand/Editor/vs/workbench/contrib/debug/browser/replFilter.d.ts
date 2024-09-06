import { ITreeFilter, TreeFilterResult, TreeVisibility } from "vs/base/browser/ui/tree/tree";
import { IReplElement } from "vs/workbench/contrib/debug/common/debug";
export declare class ReplFilter implements ITreeFilter<IReplElement> {
    static matchQuery: any;
    private _parsedQueries;
    set filterQuery(query: string);
    filter(element: IReplElement, parentVisibility: TreeVisibility): TreeFilterResult<void>;
}
