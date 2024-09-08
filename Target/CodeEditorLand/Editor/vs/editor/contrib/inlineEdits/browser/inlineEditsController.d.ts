import { Disposable } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import type { ICodeEditor } from "../../../browser/editorBrowser.js";
import { ILanguageFeatureDebounceService } from "../../../common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { InlineEditsModel } from "./inlineEditsModel.js";
import { InlineEditsWidget } from "./inlineEditsWidget.js";
export declare class InlineEditsController extends Disposable {
    readonly editor: ICodeEditor;
    private readonly _instantiationService;
    private readonly _contextKeyService;
    private readonly _debounceService;
    private readonly _languageFeaturesService;
    private readonly _configurationService;
    static ID: string;
    static get(editor: ICodeEditor): InlineEditsController | null;
    private readonly _enabled;
    private readonly _editorObs;
    private readonly _selection;
    private readonly _debounceValue;
    readonly model: import("../../../../base/common/observable.js").IObservable<InlineEditsModel | undefined, unknown>;
    private readonly _hadInlineEdit;
    protected readonly _widget: import("../../../../base/common/observable.js").IObservable<InlineEditsWidget | undefined, unknown>;
    constructor(editor: ICodeEditor, _instantiationService: IInstantiationService, _contextKeyService: IContextKeyService, _debounceService: ILanguageFeatureDebounceService, _languageFeaturesService: ILanguageFeaturesService, _configurationService: IConfigurationService);
}
