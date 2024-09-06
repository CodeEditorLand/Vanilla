import { IReader } from "./observable.js";
export declare function readHotReloadableExport<T>(value: T, reader: IReader | undefined): T;
export declare function observeHotReloadableExports(values: any[], reader: IReader | undefined): void;
