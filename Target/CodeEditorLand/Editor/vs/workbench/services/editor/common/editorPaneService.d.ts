import type { Event } from "../../../../base/common/event.js";
import type { IWillInstantiateEditorPaneEvent } from "../../../common/editor.js";
export declare const IEditorPaneService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IEditorPaneService>;
export interface IEditorPaneService {
    readonly _serviceBrand: undefined;
    /**
     * Emitted when an editor pane is about to be instantiated.
     */
    readonly onWillInstantiateEditorPane: Event<IWillInstantiateEditorPaneEvent>;
    /**
     * Returns whether a editor pane with the given type id has been instantiated.
     */
    didInstantiateEditorPane(typeId: string): boolean;
}
