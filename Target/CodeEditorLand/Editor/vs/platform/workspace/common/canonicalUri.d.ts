import { CancellationToken } from "vs/base/common/cancellation";
import { IDisposable } from "vs/base/common/lifecycle";
import { URI, UriComponents } from "vs/base/common/uri";
export interface ICanonicalUriProvider {
    readonly scheme: string;
    provideCanonicalUri(uri: UriComponents, targetScheme: string, token: CancellationToken): Promise<URI | undefined>;
}
export declare const ICanonicalUriService: any;
export interface ICanonicalUriService {
    readonly _serviceBrand: undefined;
    registerCanonicalUriProvider(provider: ICanonicalUriProvider): IDisposable;
}
