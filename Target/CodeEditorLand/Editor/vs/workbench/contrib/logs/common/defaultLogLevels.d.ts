import { Event } from "vs/base/common/event";
import { LogLevel } from "vs/platform/log/common/log";
interface ParsedArgvLogLevels {
    default?: LogLevel;
    extensions?: [string, LogLevel][];
}
export type DefaultLogLevels = Required<Readonly<ParsedArgvLogLevels>>;
export declare const IDefaultLogLevelsService: any;
export interface IDefaultLogLevelsService {
    readonly _serviceBrand: undefined;
    /**
     * An event which fires when default log levels are changed
     */
    readonly onDidChangeDefaultLogLevels: Event<void>;
    getDefaultLogLevels(): Promise<DefaultLogLevels>;
    getDefaultLogLevel(extensionId?: string): Promise<LogLevel>;
    setDefaultLogLevel(logLevel: LogLevel, extensionId?: string): Promise<void>;
    migrateLogLevels(): void;
}
export {};
