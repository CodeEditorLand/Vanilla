import { IValueWithChangeEvent } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { ContextKeyValue } from "vs/platform/contextkey/common/contextkey";
export declare const IMultiDiffSourceResolverService: any;
export interface IMultiDiffSourceResolverService {
    readonly _serviceBrand: undefined;
    registerResolver(resolver: IMultiDiffSourceResolver): IDisposable;
    resolve(uri: URI): Promise<IResolvedMultiDiffSource | undefined>;
}
export interface IMultiDiffSourceResolver {
    canHandleUri(uri: URI): boolean;
    resolveDiffSource(uri: URI): Promise<IResolvedMultiDiffSource>;
}
export interface IResolvedMultiDiffSource {
    readonly resources: IValueWithChangeEvent<readonly MultiDiffEditorItem[]>;
    readonly contextKeys?: Record<string, ContextKeyValue>;
}
export declare class MultiDiffEditorItem {
    readonly originalUri: URI | undefined;
    readonly modifiedUri: URI | undefined;
    readonly goToFileUri: URI | undefined;
    readonly contextKeys?: Record<string, ContextKeyValue> | undefined;
    constructor(originalUri: URI | undefined, modifiedUri: URI | undefined, goToFileUri: URI | undefined, contextKeys?: Record<string, ContextKeyValue> | undefined);
    getKey(): string;
}
export declare class MultiDiffSourceResolverService implements IMultiDiffSourceResolverService {
    readonly _serviceBrand: undefined;
    private readonly _resolvers;
    registerResolver(resolver: IMultiDiffSourceResolver): IDisposable;
    resolve(uri: URI): Promise<IResolvedMultiDiffSource | undefined>;
}
