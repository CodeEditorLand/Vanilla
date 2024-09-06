import { Disposable } from "vs/base/common/lifecycle";
import { MainThreadNotebookRenderersShape } from "vs/workbench/api/common/extHost.protocol";
import { INotebookRendererMessagingService } from "vs/workbench/contrib/notebook/common/notebookRendererMessagingService";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
export declare class MainThreadNotebookRenderers extends Disposable implements MainThreadNotebookRenderersShape {
    private readonly messaging;
    private readonly proxy;
    constructor(extHostContext: IExtHostContext, messaging: INotebookRendererMessagingService);
    $postMessage(editorId: string | undefined, rendererId: string, message: unknown): Promise<boolean>;
}
