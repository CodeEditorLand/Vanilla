import type * as vscode from "vscode";
import type { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { type ExtHostNotebookRenderersShape, type IMainContext } from "./extHost.protocol.js";
import type { ExtHostNotebookController } from "./extHostNotebook.js";
export declare class ExtHostNotebookRenderers implements ExtHostNotebookRenderersShape {
    private readonly _extHostNotebook;
    private readonly _rendererMessageEmitters;
    private readonly proxy;
    constructor(mainContext: IMainContext, _extHostNotebook: ExtHostNotebookController);
    $postRendererMessage(editorId: string, rendererId: string, message: unknown): void;
    createRendererMessaging(manifest: IExtensionDescription, rendererId: string): vscode.NotebookRendererMessaging;
    private getOrCreateEmitterFor;
}
