import type * as dom from "../../../../base/browser/dom.js";
import type { CancellationToken } from "../../../../base/common/cancellation.js";
import { IContextKeyService, type IScopedContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import type { IEditorOptions } from "../../../../platform/editor/common/editor.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import type { IEditorOpenContext } from "../../../common/editor.js";
import type { IEditorGroup } from "../../../services/editor/common/editorGroupsService.js";
import type { IExportableChatData, ISerializableChatData } from "../common/chatModel.js";
import { ChatEditorInput } from "./chatEditorInput.js";
export interface IChatEditorOptions extends IEditorOptions {
    target?: {
        sessionId: string;
    } | {
        data: IExportableChatData | ISerializableChatData;
    };
}
export declare class ChatEditor extends EditorPane {
    private readonly instantiationService;
    private readonly storageService;
    private readonly contextKeyService;
    private widget;
    private _scopedContextKeyService;
    get scopedContextKeyService(): IScopedContextKeyService;
    private _memento;
    private _viewState;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, instantiationService: IInstantiationService, storageService: IStorageService, contextKeyService: IContextKeyService);
    private clear;
    protected createEditor(parent: HTMLElement): void;
    protected setEditorVisible(visible: boolean): void;
    focus(): void;
    clearInput(): void;
    setInput(input: ChatEditorInput, options: IChatEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    private updateModel;
    protected saveState(): void;
    layout(dimension: dom.Dimension, position?: dom.IDomPosition | undefined): void;
}
