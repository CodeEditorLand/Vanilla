import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { ExtHostAiRelatedInformationShape, IMainContext } from "vs/workbench/api/common/extHost.protocol";
import { Disposable } from "vs/workbench/api/common/extHostTypes";
import type { CancellationToken, RelatedInformationProvider, RelatedInformationResult, RelatedInformationType } from "vscode";
export declare class ExtHostRelatedInformation implements ExtHostAiRelatedInformationShape {
    private _relatedInformationProviders;
    private _nextHandle;
    private readonly _proxy;
    constructor(mainContext: IMainContext);
    $provideAiRelatedInformation(handle: number, query: string, token: CancellationToken): Promise<RelatedInformationResult[]>;
    getRelatedInformation(extension: IExtensionDescription, query: string, types: RelatedInformationType[]): Promise<RelatedInformationResult[]>;
    registerRelatedInformationProvider(extension: IExtensionDescription, type: RelatedInformationType, provider: RelatedInformationProvider): Disposable;
}
