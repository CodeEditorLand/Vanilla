import { IInteractiveDocumentService } from "../../contrib/interactive/browser/interactiveDocumentService.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { type MainThreadInteractiveShape } from "../common/extHost.protocol.js";
export declare class MainThreadInteractive implements MainThreadInteractiveShape {
    private readonly _proxy;
    private readonly _disposables;
    constructor(extHostContext: IExtHostContext, interactiveDocumentService: IInteractiveDocumentService);
    dispose(): void;
}
