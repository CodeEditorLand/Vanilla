import { type UriComponents } from "../../../base/common/uri.js";
import { IQuickDiffService } from "../../contrib/scm/common/quickDiff.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { type IDocumentFilterDto, type MainThreadQuickDiffShape } from "../common/extHost.protocol.js";
export declare class MainThreadQuickDiff implements MainThreadQuickDiffShape {
    private readonly quickDiffService;
    private readonly proxy;
    private providerDisposables;
    constructor(extHostContext: IExtHostContext, quickDiffService: IQuickDiffService);
    $registerQuickDiffProvider(handle: number, selector: IDocumentFilterDto[], label: string, rootUri: UriComponents | undefined): Promise<void>;
    $unregisterQuickDiffProvider(handle: number): Promise<void>;
    dispose(): void;
}