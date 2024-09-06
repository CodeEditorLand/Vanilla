import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IProgressService } from "vs/platform/progress/common/progress";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { InspectSubject } from "vs/workbench/contrib/testing/browser/testResultsView/testResultsSubject";
import { ITestCoverageService } from "vs/workbench/contrib/testing/common/testCoverageService";
import { ITestExplorerFilterState } from "vs/workbench/contrib/testing/common/testExplorerFilterState";
import { ITestResultService } from "vs/workbench/contrib/testing/common/testResultService";
export declare class OutputPeekTree extends Disposable {
    private readonly contextMenuService;
    private disposed;
    private readonly tree;
    private readonly treeActions;
    private readonly requestReveal;
    readonly onDidRequestReview: any;
    constructor(container: HTMLElement, onDidReveal: Event<{
        subject: InspectSubject;
        preserveFocus: boolean;
    }>, options: {
        showRevealLocationOnMessages: boolean;
        locationForProgress: string;
    }, contextMenuService: IContextMenuService, results: ITestResultService, instantiationService: IInstantiationService, explorerFilter: ITestExplorerFilterState, coverageService: ITestCoverageService, progressService: IProgressService, telemetryService: ITelemetryService);
    layout(height: number, width: number): void;
    private onContextMenu;
    dispose(): void;
}
