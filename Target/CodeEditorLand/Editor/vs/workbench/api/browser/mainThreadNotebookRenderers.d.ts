import { Disposable } from "../../../base/common/lifecycle.js";
import { INotebookRendererMessagingService } from "../../contrib/notebook/common/notebookRendererMessagingService.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { type MainThreadNotebookRenderersShape } from "../common/extHost.protocol.js";
export declare class MainThreadNotebookRenderers extends Disposable implements MainThreadNotebookRenderersShape {
    private readonly messaging;
    private readonly proxy;
    constructor(extHostContext: IExtHostContext, messaging: INotebookRendererMessagingService);
    $postMessage(editorId: string | undefined, rendererId: string, message: unknown): Promise<boolean>;
}
