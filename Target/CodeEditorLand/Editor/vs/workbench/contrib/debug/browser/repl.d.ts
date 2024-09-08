import { IHistoryNavigationWidget } from '../../../../base/browser/history.js';
import { IActionViewItem } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { IAsyncDataSource } from '../../../../base/browser/ui/tree/tree.js';
import { IAction } from '../../../../base/common/actions.js';
import './media/repl.css';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { CodeEditorWidget } from '../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ITextResourcePropertiesService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { IMenuService } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { FilterViewPane, IViewPaneOptions } from '../../../browser/parts/views/viewPane.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { IDebugService, IDebugSession, IReplElement } from '../common/debug.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
export declare class Repl extends FilterViewPane implements IHistoryNavigationWidget {
    private readonly debugService;
    private readonly storageService;
    private readonly modelService;
    protected readonly configurationService: IConfigurationService;
    private readonly textResourcePropertiesService;
    private readonly editorService;
    protected readonly keybindingService: IKeybindingService;
    private readonly languageFeaturesService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private static readonly REFRESH_DELAY;
    private static readonly URI;
    private history;
    private tree?;
    private replOptions;
    private previousTreeScrollHeight;
    private replDelegate;
    private container;
    private treeContainer;
    private replInput;
    private replInputContainer;
    private bodyContentDimension;
    private replInputLineCount;
    private model;
    private setHistoryNavigationEnablement;
    private scopedInstantiationService;
    private replElementsChangeListener;
    private styleElement;
    private styleChangedWhenInvisible;
    private completionItemProvider;
    private modelChangeListener;
    private filter;
    private multiSessionRepl;
    private menu;
    private replDataSource;
    private findIsOpen;
    constructor(options: IViewPaneOptions, debugService: IDebugService, instantiationService: IInstantiationService, storageService: IStorageService, themeService: IThemeService, modelService: IModelService, contextKeyService: IContextKeyService, codeEditorService: ICodeEditorService, viewDescriptorService: IViewDescriptorService, contextMenuService: IContextMenuService, configurationService: IConfigurationService, textResourcePropertiesService: ITextResourcePropertiesService, editorService: IEditorService, keybindingService: IKeybindingService, openerService: IOpenerService, telemetryService: ITelemetryService, hoverService: IHoverService, menuService: IMenuService, languageFeaturesService: ILanguageFeaturesService, logService: ILogService);
    private registerListeners;
    private onDidFocusSession;
    getFilterStats(): {
        total: number;
        filtered: number;
    };
    get isReadonly(): boolean;
    showPreviousValue(): void;
    showNextValue(): void;
    focusFilter(): void;
    openFind(): void;
    private setMode;
    private onDidStyleChange;
    private navigateHistory;
    selectSession(session?: IDebugSession): Promise<void>;
    clearRepl(): Promise<void>;
    acceptReplInput(): void;
    sendReplInput(input: string): void;
    getVisibleContent(): string;
    protected layoutBodyContent(height: number, width: number): void;
    collapseAll(): void;
    getDebugSession(): IDebugSession | undefined;
    getReplInput(): CodeEditorWidget;
    getReplDataSource(): IAsyncDataSource<IDebugSession, IReplElement> | undefined;
    getFocusedElement(): IReplElement | undefined;
    focusTree(): void;
    focus(): void;
    getActionViewItem(action: IAction): IActionViewItem | undefined;
    private get isMultiSessionView();
    private get refreshScheduler();
    render(): void;
    protected renderBody(parent: HTMLElement): void;
    private createReplTree;
    private createReplInput;
    private getAriaLabel;
    private onContextMenu;
    private refreshReplElements;
    private updateInputDecoration;
    saveState(): void;
    dispose(): void;
}
export declare function getReplView(viewsService: IViewsService): Repl | undefined;
