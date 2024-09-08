import { Disposable } from "../../../../../base/common/lifecycle.js";
import { type IObservable, type ITransaction } from "../../../../../base/common/observable.js";
import { IAccessibilityService } from "../../../../../platform/accessibility/common/accessibility.js";
import { IAccessibilitySignalService } from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import type { ICodeEditor } from "../../../../browser/editorBrowser.js";
import type { Range } from "../../../../common/core/range.js";
import { ILanguageFeatureDebounceService } from "../../../../common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../../../common/services/languageFeatures.js";
import { InlineCompletionsModel } from "../model/inlineCompletionsModel.js";
export declare class InlineCompletionsController extends Disposable {
    readonly editor: ICodeEditor;
    private readonly _instantiationService;
    private readonly _contextKeyService;
    private readonly _configurationService;
    private readonly _commandService;
    private readonly _debounceService;
    private readonly _languageFeaturesService;
    private readonly _accessibilitySignalService;
    private readonly _keybindingService;
    private readonly _accessibilityService;
    static ID: string;
    static get(editor: ICodeEditor): InlineCompletionsController | null;
    private readonly _editorObs;
    private readonly _positions;
    private readonly _suggestWidgetAdaptor;
    private readonly _suggestWidgetSelectedItem;
    private readonly _enabledInConfig;
    private readonly _isScreenReaderEnabled;
    private readonly _editorDictationInProgress;
    private readonly _enabled;
    private readonly _debounceValue;
    readonly model: IObservable<InlineCompletionsModel | undefined, unknown>;
    private readonly _ghostTexts;
    private readonly _stablizedGhostTexts;
    private readonly _ghostTextWidgets;
    private readonly _playAccessibilitySignal;
    private readonly _fontFamily;
    constructor(editor: ICodeEditor, _instantiationService: IInstantiationService, _contextKeyService: IContextKeyService, _configurationService: IConfigurationService, _commandService: ICommandService, _debounceService: ILanguageFeatureDebounceService, _languageFeaturesService: ILanguageFeaturesService, _accessibilitySignalService: IAccessibilitySignalService, _keybindingService: IKeybindingService, _accessibilityService: IAccessibilityService);
    playAccessibilitySignal(tx: ITransaction): void;
    private _provideScreenReaderUpdate;
    shouldShowHoverAt(range: Range): boolean;
    shouldShowHoverAtViewZone(viewZoneId: string): boolean;
    hide(): void;
}
