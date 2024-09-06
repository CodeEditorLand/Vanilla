import { Disposable } from "vs/base/common/lifecycle";
import { IEnvironmentService } from "vs/platform/environment/common/environment";
import { ILoggerService, ILogService } from "vs/platform/log/common/log";
import { IProductService } from "vs/platform/product/common/productService";
import { ITelemetryAppender } from "vs/platform/telemetry/common/telemetryUtils";
export declare class TelemetryLogAppender extends Disposable implements ITelemetryAppender {
    private readonly prefix;
    private readonly logger;
    constructor(logService: ILogService, loggerService: ILoggerService, environmentService: IEnvironmentService, productService: IProductService, prefix?: string);
    flush(): Promise<any>;
    log(eventName: string, data: any): void;
}
