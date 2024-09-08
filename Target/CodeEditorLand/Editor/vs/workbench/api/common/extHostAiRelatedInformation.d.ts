import type { CancellationToken, RelatedInformationProvider, RelatedInformationResult, RelatedInformationType } from "vscode";
import type { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { type ExtHostAiRelatedInformationShape, type IMainContext } from "./extHost.protocol.js";
import { Disposable } from "./extHostTypes.js";
export declare class ExtHostRelatedInformation implements ExtHostAiRelatedInformationShape {
    private _relatedInformationProviders;
    private _nextHandle;
    private readonly _proxy;
    constructor(mainContext: IMainContext);
    $provideAiRelatedInformation(handle: number, query: string, token: CancellationToken): Promise<RelatedInformationResult[]>;
    getRelatedInformation(extension: IExtensionDescription, query: string, types: RelatedInformationType[]): Promise<RelatedInformationResult[]>;
    registerRelatedInformationProvider(extension: IExtensionDescription, type: RelatedInformationType, provider: RelatedInformationProvider): Disposable;
}
