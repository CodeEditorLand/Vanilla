import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IProgressIndicator } from "vs/platform/progress/common/progress";
import { PaneCompositeDescriptor } from "vs/workbench/browser/panecomposite";
import { IPaneComposite } from "vs/workbench/common/panecomposite";
import { ViewContainerLocation } from "vs/workbench/common/views";
import { IPaneCompositePartService } from "vs/workbench/services/panecomposite/browser/panecomposite";
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
