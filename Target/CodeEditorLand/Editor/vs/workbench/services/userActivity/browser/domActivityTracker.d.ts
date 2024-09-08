import { Disposable } from "../../../../base/common/lifecycle.js";
import type { IUserActivityService } from "../common/userActivityService.js";
export declare class DomActivityTracker extends Disposable {
    constructor(userActivityService: IUserActivityService);
}
