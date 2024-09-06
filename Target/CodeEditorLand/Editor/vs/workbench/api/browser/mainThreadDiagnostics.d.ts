import { UriComponents } from "vs/base/common/uri";
import { IMarkerData, IMarkerService } from "vs/platform/markers/common/markers";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
import { MainThreadDiagnosticsShape } from "../common/extHost.protocol";
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
