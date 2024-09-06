import { IViewDescriptor, IViewDescriptorService, ViewContainerLocation } from '../../../../../common/views.js';
export declare class TestViewDescriptorService implements Partial<IViewDescriptorService> {
    private _location;
    private _onDidChangeLocation;
    onDidChangeLocation: import("../../../../../../base/common/event.js").Event<{
        views: IViewDescriptor[];
        from: ViewContainerLocation;
        to: ViewContainerLocation;
    }>;
    getViewLocationById(id: string): ViewContainerLocation;
    moveTerminalToLocation(to: ViewContainerLocation): void;
}
