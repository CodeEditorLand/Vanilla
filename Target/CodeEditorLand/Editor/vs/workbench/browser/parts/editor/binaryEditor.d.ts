import { IEditorOptions } from "vs/platform/editor/common/editor";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { EditorPlaceholder, IEditorPlaceholderContents } from "vs/workbench/browser/parts/editor/editorPlaceholder";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import { IEditorGroup } from "vs/workbench/services/editor/common/editorGroupsService";
export interface IOpenCallbacks {
    openInternal: (input: EditorInput, options: IEditorOptions | undefined) => Promise<void>;
}
export declare abstract class BaseBinaryResourceEditor extends EditorPlaceholder {
    private readonly callbacks;
    private readonly _onDidChangeMetadata;
    readonly onDidChangeMetadata: any;
    private readonly _onDidOpenInPlace;
    readonly onDidOpenInPlace: any;
    private metadata;
    constructor(id: string, group: IEditorGroup, callbacks: IOpenCallbacks, telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService);
    getTitle(): string;
    protected getContents(input: EditorInput, options: IEditorOptions): Promise<IEditorPlaceholderContents>;
    private handleMetadataChanged;
    getMetadata(): string | undefined;
}
