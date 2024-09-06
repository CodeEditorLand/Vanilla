import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import "vs/css!./testResultsViewContent";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { ITextModelService } from "vs/editor/common/services/resolverService";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { InspectSubject } from "vs/workbench/contrib/testing/browser/testResultsView/testResultsSubject";
import { IObservableValue } from "vs/workbench/contrib/testing/common/observableValue";
/** UI state that can be saved/restored, used to give a nice experience when switching stack frames */
export interface ITestResultsViewContentUiState {
    splitViewWidths: number[];
}
export declare class TestResultsViewContent extends Disposable {
    private readonly editor;
    private readonly options;
    private readonly instantiationService;
    protected readonly modelService: ITextModelService;
    private readonly contextKeyService;
    private readonly uriIdentityService;
    private static lastSplitWidth?;
    private readonly didReveal;
    private readonly currentSubjectStore;
    private readonly onCloseEmitter;
    private followupWidget;
    private messageContextKeyService;
    private contextKeyTestMessage;
    private contextKeyResultOutdated;
    private stackContainer;
    private callStackWidget;
    private currentTopFrame?;
    private isDoingLayoutUpdate?;
    private dimension?;
    private splitView;
    private messageContainer;
    private contentProviders;
    private contentProvidersUpdateLimiter;
    current?: InspectSubject;
    /** Fired when a tree item is selected. Populated only on .fillBody() */
    onDidRequestReveal: Event<InspectSubject>;
    readonly onClose: any;
    get uiState(): ITestResultsViewContentUiState;
    constructor(editor: ICodeEditor | undefined, options: {
        historyVisible: IObservableValue<boolean>;
        showRevealLocationOnMessages: boolean;
        locationForProgress: string;
    }, instantiationService: IInstantiationService, modelService: ITextModelService, contextKeyService: IContextKeyService, uriIdentityService: IUriIdentityService);
    fillBody(containerElement: HTMLElement): void;
    /**
     * Shows a message in-place without showing or changing the peek location.
     * This is mostly used if peeking a message without a location.
     */
    reveal(opts: {
        subject: InspectSubject;
        preserveFocus: boolean;
    }): any;
    private getCallFrames;
    private prepareTopFrame;
    private layoutContentWidgets;
    private populateFloatingClick;
    onLayoutBody(height: number, width: number): void;
    onWidth(width: number): void;
}
