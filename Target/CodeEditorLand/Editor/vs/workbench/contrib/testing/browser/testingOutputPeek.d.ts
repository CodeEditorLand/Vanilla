import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { EditorAction2 } from "vs/editor/browser/editorExtensions";
import { ICodeEditorService } from "vs/editor/browser/services/codeEditorService";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { Action2 } from "vs/platform/actions/common/actions";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { ITextEditorOptions } from "vs/platform/editor/common/editor";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IViewPaneOptions, ViewPane } from "vs/workbench/browser/parts/views/viewPane";
import { IViewDescriptorService } from "vs/workbench/common/views";
import { InspectSubject } from "vs/workbench/contrib/testing/browser/testResultsView/testResultsSubject";
import { IShowResultOptions, ITestingPeekOpener } from "vs/workbench/contrib/testing/common/testingPeekOpener";
import { ITestResult } from "vs/workbench/contrib/testing/common/testResult";
import { ITestResultService } from "vs/workbench/contrib/testing/common/testResultService";
import { ITestService } from "vs/workbench/contrib/testing/common/testService";
import { TestResultItem } from "vs/workbench/contrib/testing/common/testTypes";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IViewsService } from "vs/workbench/services/views/common/viewsService";
export declare class TestingPeekOpener extends Disposable implements ITestingPeekOpener {
    private readonly configuration;
    private readonly editorService;
    private readonly codeEditorService;
    private readonly testResults;
    private readonly testService;
    private readonly storageService;
    private readonly viewsService;
    private readonly commandService;
    private readonly notificationService;
    _serviceBrand: undefined;
    private lastUri?;
    /** @inheritdoc */
    readonly historyVisible: any;
    constructor(configuration: IConfigurationService, editorService: IEditorService, codeEditorService: ICodeEditorService, testResults: ITestResultService, testService: ITestService, storageService: IStorageService, viewsService: IViewsService, commandService: ICommandService, notificationService: INotificationService);
    /** @inheritdoc */
    open(): Promise<boolean>;
    /** @inheritdoc */
    tryPeekFirstError(result: ITestResult, test: TestResultItem, options?: Partial<ITextEditorOptions>): boolean;
    /** @inheritdoc */
    peekUri(uri: URI, options?: IShowResultOptions): boolean;
    /** @inheritdoc */
    closeAllPeeks(): void;
    openCurrentInEditor(): void;
    private getActiveControl;
    /** @inheritdoc */
    private showPeekFromUri;
    /**
     * Opens the peek view on a test failure, based on user preferences.
     */
    private openPeekOnFailure;
    /**
     * Gets the message closest to the given position from a test in the file.
     */
    private getFileCandidateMessage;
    /**
     * Gets any possible still-relevant message from the results.
     */
    private getAnyCandidateMessage;
    /**
     * Gets the first failed message that can be displayed from the result.
     */
    private getFailedCandidateMessage;
}
/**
 * Adds output/message peek functionality to code editors.
 */
export declare class TestingOutputPeekController extends Disposable implements IEditorContribution {
    private readonly editor;
    private readonly codeEditorService;
    private readonly instantiationService;
    private readonly testResults;
    /**
     * Gets the controller associated with the given code editor.
     */
    static get(editor: ICodeEditor): TestingOutputPeekController | null;
    /**
     * Currently-shown peek view.
     */
    private readonly peek;
    /**
     * Context key updated when the peek is visible/hidden.
     */
    private readonly visible;
    /**
     * Gets the currently display subject. Undefined if the peek is not open.
     */
    get subject(): any;
    constructor(editor: ICodeEditor, codeEditorService: ICodeEditorService, instantiationService: IInstantiationService, testResults: ITestResultService, contextKeyService: IContextKeyService);
    /**
     * Shows a peek for the message in the editor.
     */
    show(uri: URI): Promise<void>;
    /**
     * Shows a peek for the existing inspect subject.
     */
    showSubject(subject: InspectSubject): Promise<void>;
    openAndShow(uri: URI): Promise<void>;
    /**
     * Disposes the peek view, if any.
     */
    removePeek(): void;
    /**
     * Shows the next message in the peek, if possible.
     */
    next(): void;
    /**
     * Shows the previous message in the peek, if possible.
     */
    previous(): void;
    /**
     * Removes the peek view if it's being displayed on the given test ID.
     */
    removeIfPeekingForTest(testId: string): void;
    /**
     * If the test we're currently showing has its state change to something
     * else, then clear the peek.
     */
    private closePeekOnTestChange;
    private closePeekOnCertainResultEvents;
    private retrieveTest;
}
export declare class TestResultsView extends ViewPane {
    private readonly resultService;
    private readonly content;
    constructor(options: IViewPaneOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService, hoverService: IHoverService, resultService: ITestResultService);
    get subject(): any;
    showLatestRun(preserveFocus?: boolean): void;
    protected renderBody(container: HTMLElement): void;
    protected layoutBody(height: number, width: number): void;
    private renderContent;
}
export declare class CloseTestPeek extends EditorAction2 {
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class GoToNextMessageAction extends Action2 {
    static readonly ID = "testing.goToNextMessage";
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class GoToPreviousMessageAction extends Action2 {
    static readonly ID = "testing.goToPreviousMessage";
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class OpenMessageInEditorAction extends Action2 {
    static readonly ID = "testing.openMessageInEditor";
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class ToggleTestingPeekHistory extends Action2 {
    static readonly ID = "testing.toggleTestingPeekHistory";
    constructor();
    run(accessor: ServicesAccessor): void;
}
