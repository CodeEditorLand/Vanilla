import { IBoundarySashes } from "vs/base/browser/ui/sash/sash";
import { CancellationToken } from "vs/base/common/cancellation";
import { Disposable } from "vs/base/common/lifecycle";
import { IExtUri } from "vs/base/common/resources";
import { URI } from "vs/base/common/uri";
import { ITextResourceConfigurationService } from "vs/editor/common/services/textResourceConfiguration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IEditorOptions } from "vs/platform/editor/common/editor";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { Composite } from "vs/workbench/browser/composite";
import { IEditorMemento, IEditorOpenContext, IEditorPane } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import { MementoObject } from "vs/workbench/common/memento";
import { IEditorGroup, IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
/**
 * The base class of editors in the workbench. Editors register themselves for specific editor inputs.
 * Editors are layed out in the editor part of the workbench in editor groups. Multiple editors can be
 * open at the same time. Each editor has a minimized representation that is good enough to provide some
 * information about the state of the editor data.
 *
 * The workbench will keep an editor alive after it has been created and show/hide it based on
 * user interaction. The lifecycle of a editor goes in the order:
 *
 * - `createEditor()`
 * - `setEditorVisible()`
 * - `layout()`
 * - `setInput()`
 * - `focus()`
 * - `dispose()`: when the editor group the editor is in closes
 *
 * During use of the workbench, a editor will often receive a `clearInput()`, `setEditorVisible()`, `layout()` and
 * `focus()` calls, but only one `create()` and `dispose()` call.
 *
 * This class is only intended to be subclassed and not instantiated.
 */
export declare abstract class EditorPane extends Composite implements IEditorPane {
    readonly group: IEditorGroup;
    readonly onDidChangeSizeConstraints: any;
    protected readonly _onDidChangeControl: any;
    readonly onDidChangeControl: any;
    private static readonly EDITOR_MEMENTOS;
    get minimumWidth(): any;
    get maximumWidth(): any;
    get minimumHeight(): any;
    get maximumHeight(): any;
    protected _input: EditorInput | undefined;
    get input(): EditorInput | undefined;
    protected _options: IEditorOptions | undefined;
    get options(): IEditorOptions | undefined;
    get window(): any;
    /**
     * Should be overridden by editors that have their own ScopedContextKeyService
     */
    get scopedContextKeyService(): IContextKeyService | undefined;
    constructor(id: string, group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService);
    create(parent: HTMLElement): void;
    /**
     * Called to create the editor in the parent HTMLElement. Subclasses implement
     * this method to construct the editor widget.
     */
    protected abstract createEditor(parent: HTMLElement): void;
    /**
     * Note: Clients should not call this method, the workbench calls this
     * method. Calling it otherwise may result in unexpected behavior.
     *
     * Sets the given input with the options to the editor. The input is guaranteed
     * to be different from the previous input that was set using the `input.matches()`
     * method.
     *
     * The provided context gives more information around how the editor was opened.
     *
     * The provided cancellation token should be used to test if the operation
     * was cancelled.
     */
    setInput(input: EditorInput, options: IEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    /**
     * Called to indicate to the editor that the input should be cleared and
     * resources associated with the input should be freed.
     *
     * This method can be called based on different contexts, e.g. when opening
     * a different input or different editor control or when closing all editors
     * in a group.
     *
     * To monitor the lifecycle of editor inputs, you should not rely on this
     * method, rather refer to the listeners on `IEditorGroup` via `IEditorGroupsService`.
     */
    clearInput(): void;
    /**
     * Note: Clients should not call this method, the workbench calls this
     * method. Calling it otherwise may result in unexpected behavior.
     *
     * Sets the given options to the editor. Clients should apply the options
     * to the current input.
     */
    setOptions(options: IEditorOptions | undefined): void;
    setVisible(visible: boolean): void;
    /**
     * Indicates that the editor control got visible or hidden.
     *
     * @param visible the state of visibility of this editor
     */
    protected setEditorVisible(visible: boolean): void;
    setBoundarySashes(_sashes: IBoundarySashes): void;
    protected getEditorMemento<T>(editorGroupService: IEditorGroupsService, configurationService: ITextResourceConfigurationService, key: string, limit?: number): IEditorMemento<T>;
    getViewState(): object | undefined;
    protected saveState(): void;
    dispose(): void;
}
export declare class EditorMemento<T> extends Disposable implements IEditorMemento<T> {
    readonly id: string;
    private readonly key;
    private readonly memento;
    private readonly limit;
    private readonly editorGroupService;
    private readonly configurationService;
    private static readonly SHARED_EDITOR_STATE;
    private cache;
    private cleanedUp;
    private editorDisposables;
    private shareEditorState;
    constructor(id: string, key: string, memento: MementoObject, limit: number, editorGroupService: IEditorGroupsService, configurationService: ITextResourceConfigurationService);
    private registerListeners;
    private updateConfiguration;
    saveEditorState(group: IEditorGroup, resource: URI, state: T): void;
    saveEditorState(group: IEditorGroup, editor: EditorInput, state: T): void;
    loadEditorState(group: IEditorGroup, resource: URI): T | undefined;
    loadEditorState(group: IEditorGroup, editor: EditorInput): T | undefined;
    clearEditorState(resource: URI, group?: IEditorGroup): void;
    clearEditorState(editor: EditorInput, group?: IEditorGroup): void;
    clearEditorStateOnDispose(resource: URI, editor: EditorInput): void;
    moveEditorState(source: URI, target: URI, comparer: IExtUri): void;
    private doGetResource;
    private doLoad;
    saveState(): void;
    private cleanUp;
}
