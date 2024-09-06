import { IReader } from "vs/base/common/observable";
export declare function readHotReloadableExport<T>(value: T, reader: IReader | undefined): T;
export declare function observeHotReloadableExports(values: any[], reader: IReader | undefined): void;
