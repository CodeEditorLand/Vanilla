import { Disposable } from "vs/base/common/lifecycle";
import { ILoggerService } from "vs/platform/log/common/log";
import { INotebookLoggingService } from "vs/workbench/contrib/notebook/common/notebookLoggingService";
export declare class NotebookLoggingService extends Disposable implements INotebookLoggingService {
    _serviceBrand: undefined;
    static ID: string;
    private readonly _logger;
    constructor(loggerService: ILoggerService);
    debug(category: string, output: string): void;
    info(category: string, output: string): void;
    warn(category: string, output: string): void;
    error(category: string, output: string): void;
}
