import { Disposable } from "../../../base/common/lifecycle.js";
import { ILabelService, ResourceLabelFormatter } from "../../../platform/label/common/label.js";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { MainThreadLabelServiceShape } from "../common/extHost.protocol.js";
export declare class MainThreadLabelService extends Disposable implements MainThreadLabelServiceShape {
    private readonly _labelService;
    private readonly _resourceLabelFormatters;
    constructor(_: IExtHostContext, _labelService: ILabelService);
    $registerResourceLabelFormatter(handle: number, formatter: ResourceLabelFormatter): void;
    $unregisterResourceLabelFormatter(handle: number): void;
}
