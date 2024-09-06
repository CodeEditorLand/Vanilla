import { ThemeIcon } from "vs/base/common/themables";
import { IMarkerService, MarkerSeverity } from "vs/platform/markers/common/markers";
import { ICellViewModel } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
export interface IOutlineMarkerInfo {
    readonly count: number;
    readonly topSev: MarkerSeverity;
}
export declare class OutlineEntry {
    readonly index: number;
    readonly level: number;
    readonly cell: ICellViewModel;
    readonly label: string;
    readonly isExecuting: boolean;
    readonly isPaused: boolean;
    readonly range?: any;
    readonly symbolKind?: any;
    private _children;
    private _parent;
    private _markerInfo;
    get icon(): ThemeIcon;
    constructor(index: number, level: number, cell: ICellViewModel, label: string, isExecuting: boolean, isPaused: boolean, range?: any, symbolKind?: any);
    addChild(entry: OutlineEntry): void;
    get parent(): OutlineEntry | undefined;
    get children(): Iterable<OutlineEntry>;
    get markerInfo(): IOutlineMarkerInfo | undefined;
    get position(): {
        startLineNumber: any;
        startColumn: any;
    } | undefined;
    updateMarkers(markerService: IMarkerService): void;
    clearMarkers(): void;
    find(cell: ICellViewModel, parents: OutlineEntry[]): OutlineEntry | undefined;
    asFlatList(bucket: OutlineEntry[]): void;
}
