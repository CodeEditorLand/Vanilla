import { type IDisposable } from "../../base/common/lifecycle.js";
import type { URI } from "../../base/common/uri.js";
import type { SyncDescriptor } from "../../platform/instantiation/common/descriptors.js";
import type { BrandedService, IInstantiationService, ServicesAccessor } from "../../platform/instantiation/common/instantiation.js";
import { type IEditorDescriptor as ICommonEditorDescriptor, type IWillInstantiateEditorPaneEvent } from "../common/editor.js";
import type { EditorInput } from "../common/editor/editorInput.js";
import type { IEditorGroup } from "../services/editor/common/editorGroupsService.js";
import type { EditorPane } from "./parts/editor/editorPane.js";
export interface IEditorPaneDescriptor extends ICommonEditorDescriptor<EditorPane> {
}
export interface IEditorPaneRegistry {
    /**
     * Registers an editor pane to the platform for the given editor type. The second parameter also supports an
     * array of input classes to be passed in. If the more than one editor is registered for the same editor
     * input, the input itself will be asked which editor it prefers if this method is provided. Otherwise
     * the first editor in the list will be returned.
     *
     * @param editorDescriptors A set of constructor functions that return an instance of `EditorInput` for which the
     * registered editor should be used for.
     */
    registerEditorPane(editorPaneDescriptor: IEditorPaneDescriptor, editorDescriptors: readonly SyncDescriptor<EditorInput>[]): IDisposable;
    /**
     * Returns the editor pane descriptor for the given editor or `undefined` if none.
     */
    getEditorPane(editor: EditorInput): IEditorPaneDescriptor | undefined;
}
/**
 * A lightweight descriptor of an editor pane. The descriptor is deferred so that heavy editor
 * panes can load lazily in the workbench.
 */
export declare class EditorPaneDescriptor implements IEditorPaneDescriptor {
    private readonly ctor;
    readonly typeId: string;
    readonly name: string;
    private static readonly instantiatedEditorPanes;
    static didInstantiateEditorPane(typeId: string): boolean;
    private static readonly _onWillInstantiateEditorPane;
    static readonly onWillInstantiateEditorPane: import("../../base/common/event.js").Event<IWillInstantiateEditorPaneEvent>;
    static create<Services extends BrandedService[]>(ctor: {
        new (group: IEditorGroup, ...services: Services): EditorPane;
    }, typeId: string, name: string): EditorPaneDescriptor;
    private constructor();
    instantiate(instantiationService: IInstantiationService, group: IEditorGroup): EditorPane;
    describes(editorPane: EditorPane): boolean;
}
export declare class EditorPaneRegistry implements IEditorPaneRegistry {
    private readonly mapEditorPanesToEditors;
    registerEditorPane(editorPaneDescriptor: EditorPaneDescriptor, editorDescriptors: readonly SyncDescriptor<EditorInput>[]): IDisposable;
    getEditorPane(editor: EditorInput): EditorPaneDescriptor | undefined;
    private findEditorPaneDescriptors;
    getEditorPaneByType(typeId: string): EditorPaneDescriptor | undefined;
    getEditorPanes(): readonly EditorPaneDescriptor[];
    getEditors(): SyncDescriptor<EditorInput>[];
}
export declare function whenEditorClosed(accessor: ServicesAccessor, resources: URI[]): Promise<void>;
export declare function computeEditorAriaLabel(input: EditorInput, index: number | undefined, group: IEditorGroup | undefined, groupCount: number | undefined): string;
