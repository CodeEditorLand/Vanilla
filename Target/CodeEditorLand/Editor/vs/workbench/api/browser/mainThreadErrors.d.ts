import { type SerializedError } from "../../../base/common/errors.js";
import { type MainThreadErrorsShape } from "../common/extHost.protocol.js";
export declare class MainThreadErrors implements MainThreadErrorsShape {
    dispose(): void;
    $onUnexpectedError(err: any | SerializedError): void;
}
