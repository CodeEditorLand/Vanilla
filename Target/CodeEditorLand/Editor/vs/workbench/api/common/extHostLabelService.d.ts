import { type IDisposable } from "../../../base/common/lifecycle.js";
import type { ResourceLabelFormatter } from "../../../platform/label/common/label.js";
import { type ExtHostLabelServiceShape, type IMainContext } from "./extHost.protocol.js";
export declare class ExtHostLabelService implements ExtHostLabelServiceShape {
    private readonly _proxy;
    private _handlePool;
    constructor(mainContext: IMainContext);
    $registerResourceLabelFormatter(formatter: ResourceLabelFormatter): IDisposable;
}
