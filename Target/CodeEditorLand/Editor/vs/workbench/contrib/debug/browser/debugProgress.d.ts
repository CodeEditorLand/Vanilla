import { IProgressService } from "../../../../platform/progress/common/progress.js";
import type { IWorkbenchContribution } from "../../../common/contributions.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { IDebugService } from "../common/debug.js";
export declare class DebugProgressContribution implements IWorkbenchContribution {
    private toDispose;
    constructor(debugService: IDebugService, progressService: IProgressService, viewsService: IViewsService);
    dispose(): void;
}