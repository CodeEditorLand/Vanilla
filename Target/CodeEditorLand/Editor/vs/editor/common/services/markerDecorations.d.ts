import { Event } from "vs/base/common/event";
import { URI } from "vs/base/common/uri";
import { Range } from "vs/editor/common/core/range";
import { IModelDecoration, ITextModel } from "vs/editor/common/model";
import { IMarker } from "vs/platform/markers/common/markers";
export declare const IMarkerDecorationsService: any;
export interface IMarkerDecorationsService {
    readonly _serviceBrand: undefined;
    onDidChangeMarker: Event<ITextModel>;
    getMarker(uri: URI, decoration: IModelDecoration): IMarker | null;
    getLiveMarkers(uri: URI): [Range, IMarker][];
}
