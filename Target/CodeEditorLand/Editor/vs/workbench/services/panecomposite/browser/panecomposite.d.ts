import type { Event } from "../../../../base/common/event.js";
import type { IProgressIndicator } from "../../../../platform/progress/common/progress.js";
import type { PaneCompositeDescriptor } from "../../../browser/panecomposite.js";
import type { IPaneComposite } from "../../../common/panecomposite.js";
import type { ViewContainerLocation } from "../../../common/views.js";
export declare const IPaneCompositePartService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IPaneCompositePartService>;
export interface IPaneCompositePartService {
    readonly _serviceBrand: undefined;
    readonly onDidPaneCompositeOpen: Event<{
        composite: IPaneComposite;
        viewContainerLocation: ViewContainerLocation;
    }>;
    readonly onDidPaneCompositeClose: Event<{
        composite: IPaneComposite;
        viewContainerLocation: ViewContainerLocation;
    }>;
    /**
     * Opens a viewlet with the given identifier and pass keyboard focus to it if specified.
     */
    openPaneComposite(id: string | undefined, viewContainerLocation: ViewContainerLocation, focus?: boolean): Promise<IPaneComposite | undefined>;
    /**
     * Returns the current active viewlet if any.
     */
    getActivePaneComposite(viewContainerLocation: ViewContainerLocation): IPaneComposite | undefined;
    /**
     * Returns the viewlet by id.
     */
    getPaneComposite(id: string, viewContainerLocation: ViewContainerLocation): PaneCompositeDescriptor | undefined;
    /**
     * Returns all enabled viewlets
     */
    getPaneComposites(viewContainerLocation: ViewContainerLocation): PaneCompositeDescriptor[];
    /**
     * Returns id of pinned view containers following the visual order.
     */
    getPinnedPaneCompositeIds(viewContainerLocation: ViewContainerLocation): string[];
    /**
     * Returns id of visible view containers following the visual order.
     */
    getVisiblePaneCompositeIds(viewContainerLocation: ViewContainerLocation): string[];
    /**
     * Returns the progress indicator for the side bar.
     */
    getProgressIndicator(id: string, viewContainerLocation: ViewContainerLocation): IProgressIndicator | undefined;
    /**
     * Hide the active viewlet.
     */
    hideActivePaneComposite(viewContainerLocation: ViewContainerLocation): void;
    /**
     * Return the last active viewlet id.
     */
    getLastActivePaneCompositeId(viewContainerLocation: ViewContainerLocation): string;
}