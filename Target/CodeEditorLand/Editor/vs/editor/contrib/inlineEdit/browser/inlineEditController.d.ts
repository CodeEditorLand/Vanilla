import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IDiffProviderFactoryService } from "vs/editor/browser/widget/diffEditor/diffProviderFactoryService";
import { Range } from "vs/editor/common/core/range";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IModelService } from "vs/editor/common/services/model";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
export declare class InlineEditController extends Disposable {
    readonly editor: ICodeEditor;
    private readonly instantiationService;
    private readonly contextKeyService;
    private readonly languageFeaturesService;
    private readonly _commandService;
    private readonly _configurationService;
    private readonly _diffProviderFactoryService;
    private readonly _modelService;
    static ID: string;
    static readonly inlineEditVisibleKey = "inlineEditVisible";
    static readonly inlineEditVisibleContext: any;
    private _isVisibleContext;
    static readonly cursorAtInlineEditKey = "cursorAtInlineEdit";
    static readonly cursorAtInlineEditContext: any;
    private _isCursorAtInlineEditContext;
    static get(editor: ICodeEditor): InlineEditController | null;
    private _currentEdit;
    private _currentWidget;
    private _currentRequestCts;
    private _jumpBackPosition;
    private _isAccepting;
    private readonly _enabled;
    private readonly _fontFamily;
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, languageFeaturesService: ILanguageFeaturesService, _commandService: ICommandService, _configurationService: IConfigurationService, _diffProviderFactoryService: IDiffProviderFactoryService, _modelService: IModelService);
    private checkCursorPosition;
    private validateInlineEdit;
    private fetchInlineEdit;
    private getInlineEdit;
    trigger(): Promise<void>;
    jumpBack(): Promise<void>;
    accept(): Promise<void>;
    jumpToCurrent(): void;
    clear(sendRejection?: boolean): Promise<void>;
    private freeEdit;
    shouldShowHoverAt(range: Range): any;
    shouldShowHoverAtViewZone(viewZoneId: string): boolean;
}