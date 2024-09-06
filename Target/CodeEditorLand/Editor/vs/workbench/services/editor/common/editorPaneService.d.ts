import { Event } from "vs/base/common/event";
import { IWillInstantiateEditorPaneEvent } from "vs/workbench/common/editor";
export declare const IEditorPaneService: any;
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
