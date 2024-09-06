import { UriComponents } from "../../../base/common/uri.js";
import { IMarkerData, IMarkerService } from "../../../platform/markers/common/markers.js";
import { IUriIdentityService } from "../../../platform/uriIdentity/common/uriIdentity.js";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { MainThreadDiagnosticsShape } from "../common/extHost.protocol.js";
export declare class MainThreadDiagnostics implements MainThreadDiagnosticsShape {
    private readonly _markerService;
    private readonly _uriIdentService;
    private readonly _activeOwners;
    private readonly _proxy;
    private readonly _markerListener;
    constructor(extHostContext: IExtHostContext, _markerService: IMarkerService, _uriIdentService: IUriIdentityService);
    dispose(): void;
    private _forwardMarkers;
    $changeMany(owner: string, entries: [UriComponents, IMarkerData[]][]): void;
    $clear(owner: string): void;
}
