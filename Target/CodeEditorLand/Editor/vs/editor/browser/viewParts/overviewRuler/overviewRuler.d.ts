import { type OverviewRulerPosition } from "../../../common/config/editorOptions.js";
import { ViewEventHandler } from "../../../common/viewEventHandler.js";
import type * as viewEvents from "../../../common/viewEvents.js";
import { type OverviewRulerZone } from "../../../common/viewModel/overviewZoneManager.js";
import type { ViewContext } from "../../../common/viewModel/viewContext.js";
import type { IOverviewRuler } from "../../editorBrowser.js";
export declare class OverviewRuler extends ViewEventHandler implements IOverviewRuler {
    private readonly _context;
    private readonly _domNode;
    private readonly _zoneManager;
    constructor(context: ViewContext, cssClassName: string);
    dispose(): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    getDomNode(): HTMLElement;
    setLayout(position: OverviewRulerPosition): void;
    setZones(zones: OverviewRulerZone[]): void;
    private _render;
    private _renderOneLane;
}
