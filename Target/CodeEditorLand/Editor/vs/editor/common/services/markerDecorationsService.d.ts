import { type Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import type { URI } from "../../../base/common/uri.js";
import { IMarkerService, type IMarker } from "../../../platform/markers/common/markers.js";
import { Range } from "../core/range.js";
import { type IModelDecoration, type ITextModel } from "../model.js";
import type { IMarkerDecorationsService } from "./markerDecorations.js";
import { IModelService } from "./model.js";
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
