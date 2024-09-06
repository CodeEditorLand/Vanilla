import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { Range } from "vs/editor/common/core/range";
import { IModelDecoration, ITextModel } from "vs/editor/common/model";
import { IMarkerDecorationsService } from "vs/editor/common/services/markerDecorations";
import { IModelService } from "vs/editor/common/services/model";
import { IMarker, IMarkerService } from "vs/platform/markers/common/markers";
export declare class MarkerDecorationsService extends Disposable implements IMarkerDecorationsService {
    private readonly _markerService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeMarker;
    readonly onDidChangeMarker: Event<ITextModel>;
    private readonly _markerDecorations;
    constructor(modelService: IModelService, _markerService: IMarkerService);
    dispose(): void;
    getMarker(uri: URI, decoration: IModelDecoration): IMarker | null;
    getLiveMarkers(uri: URI): [Range, IMarker][];
    private _handleMarkerChange;
    private _onModelAdded;
    private _onModelRemoved;
    private _updateDecorations;
}
