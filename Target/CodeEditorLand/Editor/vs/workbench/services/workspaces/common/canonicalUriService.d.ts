import { CancellationToken } from "vs/base/common/cancellation";
import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { ICanonicalUriProvider, ICanonicalUriService } from "vs/platform/workspace/common/canonicalUri";
export declare class CanonicalUriService implements ICanonicalUriService {
    readonly _serviceBrand: undefined;
    private readonly _providers;
    registerCanonicalUriProvider(provider: ICanonicalUriProvider): IDisposable;
    provideCanonicalUri(uri: URI, targetScheme: string, token: CancellationToken): Promise<URI | undefined>;
}
