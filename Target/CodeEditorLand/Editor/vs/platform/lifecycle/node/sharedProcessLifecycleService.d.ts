import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { ILogService } from "vs/platform/log/common/log";
export declare const ISharedProcessLifecycleService: any;
export interface ISharedProcessLifecycleService {
    readonly _serviceBrand: undefined;
    /**
     * An event for when the application will shutdown
     */
    readonly onWillShutdown: Event<void>;
}
export declare class SharedProcessLifecycleService extends Disposable implements ISharedProcessLifecycleService {
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly _onWillShutdown;
    readonly onWillShutdown: any;
    constructor(logService: ILogService);
    fireOnWillShutdown(): void;
}
