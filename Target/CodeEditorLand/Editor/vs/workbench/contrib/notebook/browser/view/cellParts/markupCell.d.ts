import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../../../editor/browser/editorBrowser.js';
import { IEditorOptions } from '../../../../../../editor/common/config/editorOptions.js';
import { ILanguageService } from '../../../../../../editor/common/languages/language.js';
import { IAccessibilityService } from '../../../../../../platform/accessibility/common/accessibility.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { IActiveNotebookEditorDelegate, ICellViewModel } from '../../notebookBrowser.js';
import { MarkdownCellRenderTemplate } from '../notebookRenderingCommon.js';
import { MarkupCellViewModel } from '../../viewModel/markupCellViewModel.js';
export declare class MarkupCell extends Disposable {
    private readonly notebookEditor;
    private readonly viewCell;
    private readonly templateData;
    private readonly renderedEditors;
    private readonly accessibilityService;
    private readonly contextKeyService;
    private readonly instantiationService;
    private readonly languageService;
    private configurationService;
    private keybindingService;
    private editor;
    private markdownAccessibilityContainer;
    private editorPart;
    private readonly localDisposables;
    private readonly focusSwitchDisposable;
    private readonly editorDisposables;
    private foldingState;
    private cellEditorOptions;
    private editorOptions;
    private _isDisposed;
    constructor(notebookEditor: IActiveNotebookEditorDelegate, viewCell: MarkupCellViewModel, templateData: MarkdownCellRenderTemplate, renderedEditors: Map<ICellViewModel, ICodeEditor | undefined>, accessibilityService: IAccessibilityService, contextKeyService: IContextKeyService, instantiationService: IInstantiationService, languageService: ILanguageService, configurationService: IConfigurationService, keybindingService: IKeybindingService);
    layoutCellParts(): void;
    private constructDOM;
    private registerListeners;
    private updateMarkupCellOptions;
    private updateCollapsedState;
    private updateForHover;
    private updateForFocusModeChange;
    private applyDecorations;
    dispose(): void;
    private updateFoldingIconShowClass;
    private viewUpdate;
    private viewUpdateCollapsed;
    private getRichText;
    private viewUpdateEditing;
    private viewUpdatePreview;
    private focusEditorIfNeeded;
    private layoutEditor;
    private onCellEditorWidthChange;
    relayoutCell(): void;
    updateEditorOptions(newValue: IEditorOptions): void;
    private layoutFoldingIndicator;
    private bindEditorListeners;
    private onCellEditorHeightChange;
}
