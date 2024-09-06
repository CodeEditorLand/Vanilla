import { URI } from "vs/base/common/uri";
import { IFileService } from "vs/platform/files/common/files";
import { AbstractLoggerService, ILogger, ILoggerOptions, ILoggerService, LogLevel } from "vs/platform/log/common/log";
export declare class FileLoggerService extends AbstractLoggerService implements ILoggerService {
    private readonly fileService;
    constructor(logLevel: LogLevel, logsHome: URI, fileService: IFileService);
    protected doCreateLogger(resource: URI, logLevel: LogLevel, options?: ILoggerOptions): ILogger;
}
