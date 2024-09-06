import { IHistoryNavigationWidget } from "../../../../base/browser/history.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { CodeEditorWidget } from "../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { ChatAgentLocation } from "../common/chatAgents.js";
import { IChatRequestVariableEntry } from "../common/chatModel.js";
import { IChatFollowup } from "../common/chatService.js";
import { IChatResponseViewModel } from "../common/chatViewModel.js";
import { IChatWidgetHistoryService } from "../common/chatWidgetHistoryService.js";
import { IChatWidget } from "./chat.js";
interface IChatInputPartOptions {
    renderFollowups: boolean;
    renderStyle?: "default" | "compact";
    menus: {
        executeToolbar: MenuId;
        inputSideToolbar?: MenuId;
        telemetrySource?: string;
    };
    editorOverflowWidgetsDomNode?: HTMLElement;
}
export declare class ChatInputPart extends Disposable implements IHistoryNavigationWidget {
    private readonly location;
    private readonly options;
    private readonly getInputState;
    private readonly historyService;
    private readonly modelService;
    private readonly instantiationService;
    private readonly contextKeyService;
    private readonly configurationService;
    private readonly keybindingService;
    private readonly accessibilityService;
    private readonly logService;
    static readonly INPUT_SCHEME = "chatSessionInput";
    private static _counter;
    private _onDidLoadInputState;
    readonly onDidLoadInputState: import("../../../../base/common/event.js").Event<any>;
    private _onDidChangeHeight;
    readonly onDidChangeHeight: import("../../../../base/common/event.js").Event<void>;
    private _onDidFocus;
    readonly onDidFocus: import("../../../../base/common/event.js").Event<void>;
    private _onDidBlur;
    readonly onDidBlur: import("../../../../base/common/event.js").Event<void>;
    private _onDidChangeContext;
    readonly onDidChangeContext: import("../../../../base/common/event.js").Event<{
        removed?: IChatRequestVariableEntry[];
        added?: IChatRequestVariableEntry[];
    }>;
    private _onDidAcceptFollowup;
    readonly onDidAcceptFollowup: import("../../../../base/common/event.js").Event<{
        followup: IChatFollowup;
        response: IChatResponseViewModel | undefined;
    }>;
    get attachedContext(): ReadonlySet<IChatRequestVariableEntry>;
    private _indexOfLastAttachedContextDeletedWithKeyboard;
    private readonly _attachedContext;
    private readonly _onDidChangeVisibility;
    private readonly _contextResourceLabels;
    private readonly inputEditorMaxHeight;
    private inputEditorHeight;
    private container;
    private inputSideToolbarContainer?;
    private followupsContainer;
    private readonly followupsDisposables;
    private attachedContextContainer;
    private readonly attachedContextDisposables;
    private _inputPartHeight;
    get inputPartHeight(): number;
    private _inputEditor;
    private _inputEditorElement;
    private toolbar;
    get inputEditor(): CodeEditorWidget;
    private history;
    private historyNavigationBackwardsEnablement;
    private historyNavigationForewardsEnablement;
    private inHistoryNavigation;
    private inputModel;
    private inputEditorHasText;
    private chatCursorAtTop;
    private inputEditorHasFocus;
    private cachedDimensions;
    private cachedToolbarWidth;
    readonly inputUri: URI;
    constructor(location: ChatAgentLocation, options: IChatInputPartOptions, getInputState: () => any, historyService: IChatWidgetHistoryService, modelService: IModelService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, keybindingService: IKeybindingService, accessibilityService: IAccessibilityService, logService: ILogService);
    private loadHistory;
    private _getAriaLabel;
    updateState(inputState: Object): void;
    initForNewChatModel(inputValue: string | undefined, inputState: Object): void;
    logInputHistory(): void;
    setVisible(visible: boolean): void;
    get element(): HTMLElement;
    showPreviousValue(): void;
    showNextValue(): void;
    private navigateHistory;
    setValue(value: string, transient: boolean): void;
    private saveCurrentValue;
    focus(): void;
    hasFocus(): boolean;
    /**
     * Reset the input and update history.
     * @param userQuery If provided, this will be added to the history. Followups and programmatic queries should not be passed.
     */
    acceptInput(isUserQuery?: boolean): Promise<void>;
    private _acceptInputForVoiceover;
    attachContext(overwrite: boolean, ...contentReferences: IChatRequestVariableEntry[]): void;
    render(container: HTMLElement, initialValue: string, widget: IChatWidget): void;
    private initAttachedContext;
    renderFollowups(items: IChatFollowup[] | undefined, response: IChatResponseViewModel | undefined): Promise<void>;
    get contentHeight(): number;
    layout(height: number, width: number): void;
    private previousInputEditorDimension;
    private _layout;
    private getLayoutData;
    saveState(): void;
}
export {};
