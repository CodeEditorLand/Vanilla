import "vs/css!./media/editorplaceholder";
import { Dimension } from "vs/base/browser/dom";
import { CancellationToken } from "vs/base/common/cancellation";
import { DisposableStore } from "vs/base/common/lifecycle";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IEditorOptions } from "vs/platform/editor/common/editor";
import { IFileService } from "vs/platform/files/common/files";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { EditorPane } from "vs/workbench/browser/parts/editor/editorPane";
import { IEditorOpenContext } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import { IEditorGroup } from "vs/workbench/services/editor/common/editorGroupsService";
export interface IEditorPlaceholderContents {
    icon: string;
    label: string;
    actions: IEditorPlaceholderContentsAction[];
}
export interface IEditorPlaceholderContentsAction {
    label: string;
    run: () => unknown;
}
export interface IErrorEditorPlaceholderOptions extends IEditorOptions {
    error?: Error;
}
export declare abstract class EditorPlaceholder extends EditorPane {
    protected static readonly PLACEHOLDER_LABEL_MAX_LENGTH = 1024;
    private container;
    private scrollbar;
    private readonly inputDisposable;
    constructor(id: string, group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService);
    protected createEditor(parent: HTMLElement): void;
    setInput(input: EditorInput, options: IEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    private renderInput;
    protected abstract getContents(input: EditorInput, options: IEditorOptions | undefined, disposables: DisposableStore): Promise<IEditorPlaceholderContents>;
    clearInput(): void;
    layout(dimension: Dimension): void;
    focus(): void;
    dispose(): void;
}
export declare class WorkspaceTrustRequiredPlaceholderEditor extends EditorPlaceholder {
    private readonly commandService;
    private readonly workspaceService;
    static readonly ID = "workbench.editors.workspaceTrustRequiredEditor";
    private static readonly LABEL;
    static readonly DESCRIPTOR: any;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, commandService: ICommandService, workspaceService: IWorkspaceContextService, storageService: IStorageService);
    getTitle(): string;
    protected getContents(): Promise<IEditorPlaceholderContents>;
}
export declare class ErrorPlaceholderEditor extends EditorPlaceholder {
    private readonly fileService;
    private readonly dialogService;
    private static readonly ID;
    private static readonly LABEL;
    static readonly DESCRIPTOR: any;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService, fileService: IFileService, dialogService: IDialogService);
    protected getContents(input: EditorInput, options: IErrorEditorPlaceholderOptions, disposables: DisposableStore): Promise<IEditorPlaceholderContents>;
}
