import { Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import type { IProgressIndicator } from "../../../platform/progress/common/progress.js";
import type { IPaneComposite } from "../../common/panecomposite.js";
import { ViewContainerLocation } from "../../common/views.js";
import { IPaneCompositePartService } from "../../services/panecomposite/browser/panecomposite.js";
import type { PaneCompositeDescriptor } from "../panecomposite.js";
export declare class PaneCompositePartService extends Disposable implements IPaneCompositePartService {
    readonly _serviceBrand: undefined;
    readonly onDidPaneCompositeOpen: Event<{
        composite: IPaneComposite;
        viewContainerLocation: ViewContainerLocation;
    }>;
    readonly onDidPaneCompositeClose: Event<{
        composite: IPaneComposite;
        viewContainerLocation: ViewContainerLocation;
    }>;
    private readonly paneCompositeParts;
    constructor(instantiationService: IInstantiationService);
    openPaneComposite(id: string | undefined, viewContainerLocation: ViewContainerLocation, focus?: boolean): Promise<IPaneComposite | undefined>;
    getActivePaneComposite(viewContainerLocation: ViewContainerLocation): IPaneComposite | undefined;
    getPaneComposite(id: string, viewContainerLocation: ViewContainerLocation): PaneCompositeDescriptor | undefined;
    getPaneComposites(viewContainerLocation: ViewContainerLocation): PaneCompositeDescriptor[];
    getPinnedPaneCompositeIds(viewContainerLocation: ViewContainerLocation): string[];
    getVisiblePaneCompositeIds(viewContainerLocation: ViewContainerLocation): string[];
    getProgressIndicator(id: string, viewContainerLocation: ViewContainerLocation): IProgressIndicator | undefined;
    hideActivePaneComposite(viewContainerLocation: ViewContainerLocation): void;
    getLastActivePaneCompositeId(viewContainerLocation: ViewContainerLocation): string;
    private getPartByLocation;
}
