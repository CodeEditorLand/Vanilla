import { Disposable } from "vs/base/common/lifecycle";
import { IUserActivityService } from "vs/workbench/services/userActivity/common/userActivityService";
export declare class DomActivityTracker extends Disposable {
    constructor(userActivityService: IUserActivityService);
}
