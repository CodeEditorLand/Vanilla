import { IView } from "vs/workbench/common/views";
import { MarkerElement, ResourceMarkers } from "vs/workbench/contrib/markers/browser/markersModel";
import { MarkersFilters } from "vs/workbench/contrib/markers/browser/markersViewActions";
import { MarkersViewMode } from "vs/workbench/contrib/markers/common/markers";
export interface IMarkersView extends IView {
    readonly filters: MarkersFilters;
    focusFilter(): void;
    clearFilterText(): void;
    getFilterStats(): {
        total: number;
        filtered: number;
    };
    getFocusElement(): MarkerElement | undefined;
    getFocusedSelectedElements(): MarkerElement[] | null;
    getAllResourceMarkers(): ResourceMarkers[];
    collapseAll(): void;
    setMultiline(multiline: boolean): void;
    setViewMode(viewMode: MarkersViewMode): void;
}
