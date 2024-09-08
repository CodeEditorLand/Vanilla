import './media/releasenoteseditor.css';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IRequestService } from '../../../../platform/request/common/request.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
export declare class ReleaseNotesManager {
    private readonly _environmentService;
    private readonly _keybindingService;
    private readonly _languageService;
    private readonly _openerService;
    private readonly _requestService;
    private readonly _configurationService;
    private readonly _editorService;
    private readonly _editorGroupService;
    private readonly _codeEditorService;
    private readonly _webviewWorkbenchService;
    private readonly _extensionService;
    private readonly _productService;
    private readonly _instantiationService;
    private readonly _simpleSettingRenderer;
    private readonly _releaseNotesCache;
    private _currentReleaseNotes;
    private _lastText;
    private readonly disposables;
    constructor(_environmentService: IEnvironmentService, _keybindingService: IKeybindingService, _languageService: ILanguageService, _openerService: IOpenerService, _requestService: IRequestService, _configurationService: IConfigurationService, _editorService: IEditorService, _editorGroupService: IEditorGroupsService, _codeEditorService: ICodeEditorService, _webviewWorkbenchService: IWebviewWorkbenchService, _extensionService: IExtensionService, _productService: IProductService, _instantiationService: IInstantiationService);
    private updateHtml;
    show(version: string, useCurrentFile: boolean): Promise<boolean>;
    private loadReleaseNotes;
    private onDidClickLink;
    private addGAParameters;
    private renderBody;
    private onDidChangeConfiguration;
    private onDidChangeActiveWebviewEditor;
    private updateCheckboxWebview;
}
