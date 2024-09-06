import * as dom from "vs/base/browser/dom";
import { CancellationToken } from "vs/base/common/cancellation";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IEditorOptions } from "vs/platform/editor/common/editor";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { EditorPane } from "vs/workbench/browser/parts/editor/editorPane";
import { IEditorOpenContext } from "vs/workbench/common/editor";
import { ChatEditorInput } from "vs/workbench/contrib/chat/browser/chatEditorInput";
import { IExportableChatData, ISerializableChatData } from "vs/workbench/contrib/chat/common/chatModel";
import { IEditorGroup } from "vs/workbench/services/editor/common/editorGroupsService";
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
