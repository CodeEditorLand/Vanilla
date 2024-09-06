import { Event } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
import { IMarker } from "../../../platform/markers/common/markers.js";
import { Range } from "../core/range.js";
import { IModelDecoration, ITextModel } from "../model.js";
export declare const IMarkerDecorationsService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IMarkerDecorationsService>;
export interface IMarkerDecorationsService {
    readonly _serviceBrand: undefined;
    onDidChangeMarker: Event<ITextModel>;
    getMarker(uri: URI, decoration: IModelDecoration): IMarker | null;
    getLiveMarkers(uri: URI): [Range, IMarker][];
}
