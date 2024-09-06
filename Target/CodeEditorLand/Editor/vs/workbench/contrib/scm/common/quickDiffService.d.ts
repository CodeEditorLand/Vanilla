import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IQuickDiffService, QuickDiff, QuickDiffProvider } from "vs/workbench/contrib/scm/common/quickDiff";
export declare class QuickDiffService extends Disposable implements IQuickDiffService {
    private readonly uriIdentityService;
    readonly _serviceBrand: undefined;
    private quickDiffProviders;
    private readonly _onDidChangeQuickDiffProviders;
    readonly onDidChangeQuickDiffProviders: any;
    constructor(uriIdentityService: IUriIdentityService);
    addQuickDiffProvider(quickDiff: QuickDiffProvider): IDisposable;
    private isQuickDiff;
    getQuickDiffs(uri: URI, language?: string, isSynchronized?: boolean): Promise<QuickDiff[]>;
}
