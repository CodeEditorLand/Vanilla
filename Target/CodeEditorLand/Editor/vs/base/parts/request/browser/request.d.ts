import type { CancellationToken } from "../../../common/cancellation.js";
import { type IRequestContext, type IRequestOptions } from "../common/request.js";
export declare function request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
