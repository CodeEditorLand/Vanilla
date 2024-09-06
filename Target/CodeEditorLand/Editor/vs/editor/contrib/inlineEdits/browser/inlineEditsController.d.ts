import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { ILanguageFeatureDebounceService } from "vs/editor/common/services/languageFeatureDebounce";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
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
    readonly model: any;
    private readonly _hadInlineEdit;
    protected readonly _widget: any;
    constructor(editor: ICodeEditor, _instantiationService: IInstantiationService, _contextKeyService: IContextKeyService, _debounceService: ILanguageFeatureDebounceService, _languageFeaturesService: ILanguageFeaturesService, _configurationService: IConfigurationService);
}
