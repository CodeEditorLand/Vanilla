var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as dom from "../../../../base/browser/dom.js";
import * as aria from "../../../../base/browser/ui/aria/aria.js";
import { MOUSE_CURSOR_TEXT_CSS_CLASS_NAME } from "../../../../base/browser/ui/mouseCursor/mouseCursor.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { memoize } from "../../../../base/common/decorators.js";
import { Emitter } from "../../../../base/common/event.js";
import { HistoryNavigator } from "../../../../base/common/history.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import {
  Disposable
} from "../../../../base/common/lifecycle.js";
import { removeAnsiEscapeCodes } from "../../../../base/common/strings.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI as uri } from "../../../../base/common/uri.js";
import {
  isCodeEditor
} from "../../../../editor/browser/editorBrowser.js";
import {
  EditorAction,
  registerEditorAction
} from "../../../../editor/browser/editorExtensions.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { CodeEditorWidget } from "../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import {
  EDITOR_FONT_DEFAULTS,
  EditorOption
} from "../../../../editor/common/config/editorOptions.js";
import { Range } from "../../../../editor/common/core/range.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import {
  CompletionItemInsertTextRule,
  CompletionItemKind,
  CompletionItemKinds
} from "../../../../editor/common/languages.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ITextResourcePropertiesService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { SuggestController } from "../../../../editor/contrib/suggest/browser/suggestController.js";
import { localize, localize2 } from "../../../../nls.js";
import {
  AccessibilitySignal,
  IAccessibilitySignalService
} from "../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { createAndFillInContextMenuActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import {
  Action2,
  IMenuService,
  MenuId,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  ContextKeyExpr,
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { registerAndCreateHistoryNavigationContext } from "../../../../platform/history/browser/contextScopedHistoryWidget.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { WorkbenchAsyncDataTree } from "../../../../platform/list/browser/listService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  editorForeground,
  resolveColorValue
} from "../../../../platform/theme/common/colorRegistry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { registerNavigableContainer } from "../../../browser/actions/widgetNavigationCommands.js";
import {
  FilterViewPane,
  ViewAction
} from "../../../browser/parts/views/viewPane.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { AccessibilityCommandId } from "../../accessibility/common/accessibilityCommands.js";
import {
  getSimpleCodeEditorWidgetOptions,
  getSimpleEditorOptions
} from "../../codeEditor/browser/simpleEditorOptions.js";
import {
  CONTEXT_DEBUG_STATE,
  CONTEXT_IN_DEBUG_REPL,
  CONTEXT_MULTI_SESSION_REPL,
  DEBUG_SCHEME,
  IDebugService,
  REPL_VIEW_ID,
  State,
  getStateLabel
} from "../common/debug.js";
import { Variable } from "../common/debugModel.js";
import { ReplEvaluationResult, ReplGroup } from "../common/replModel.js";
import { FocusSessionActionViewItem } from "./debugActionViewItems.js";
import { DebugExpressionRenderer } from "./debugExpressionRenderer.js";
import {
  debugConsoleClearAll,
  debugConsoleEvaluationPrompt
} from "./debugIcons.js";
import "./media/repl.css";
import { ReplFilter } from "./replFilter.js";
import {
  ReplAccessibilityProvider,
  ReplDataSource,
  ReplDelegate,
  ReplEvaluationInputsRenderer,
  ReplEvaluationResultsRenderer,
  ReplGroupRenderer,
  ReplOutputElementRenderer,
  ReplRawObjectsRenderer,
  ReplVariablesRenderer
} from "./replViewer.js";
const $ = dom.$;
const HISTORY_STORAGE_KEY = "debug.repl.history";
const FILTER_HISTORY_STORAGE_KEY = "debug.repl.filterHistory";
const FILTER_VALUE_STORAGE_KEY = "debug.repl.filterValue";
const DECORATION_KEY = "replinputdecoration";
function revealLastElement(tree) {
  tree.scrollTop = tree.scrollHeight - tree.renderHeight;
}
__name(revealLastElement, "revealLastElement");
const sessionsToIgnore = /* @__PURE__ */ new Set();
const identityProvider = { getId: /* @__PURE__ */ __name((element) => element.getId(), "getId") };
let Repl = class extends FilterViewPane {
  constructor(options, debugService, instantiationService, storageService, themeService, modelService, contextKeyService, codeEditorService, viewDescriptorService, contextMenuService, configurationService, textResourcePropertiesService, editorService, keybindingService, openerService, telemetryService, hoverService, menuService, languageFeaturesService, logService) {
    const filterText = storageService.get(
      FILTER_VALUE_STORAGE_KEY,
      StorageScope.WORKSPACE,
      ""
    );
    super(
      {
        ...options,
        filterOptions: {
          placeholder: localize(
            {
              key: "workbench.debug.filter.placeholder",
              comment: [
                "Text in the brackets after e.g. is not localizable"
              ]
            },
            "Filter (e.g. text, !exclude, \\escape)"
          ),
          text: filterText,
          history: JSON.parse(
            storageService.get(
              FILTER_HISTORY_STORAGE_KEY,
              StorageScope.WORKSPACE,
              "[]"
            )
          )
        }
      },
      keybindingService,
      contextMenuService,
      configurationService,
      contextKeyService,
      viewDescriptorService,
      instantiationService,
      openerService,
      themeService,
      telemetryService,
      hoverService
    );
    this.debugService = debugService;
    this.storageService = storageService;
    this.modelService = modelService;
    this.configurationService = configurationService;
    this.textResourcePropertiesService = textResourcePropertiesService;
    this.editorService = editorService;
    this.keybindingService = keybindingService;
    this.languageFeaturesService = languageFeaturesService;
    this.logService = logService;
    this.menu = menuService.createMenu(
      MenuId.DebugConsoleContext,
      contextKeyService
    );
    this._register(this.menu);
    this.history = new HistoryNavigator(
      JSON.parse(
        this.storageService.get(
          HISTORY_STORAGE_KEY,
          StorageScope.WORKSPACE,
          "[]"
        )
      ),
      100
    );
    this.filter = new ReplFilter();
    this.filter.filterQuery = filterText;
    this.multiSessionRepl = CONTEXT_MULTI_SESSION_REPL.bindTo(contextKeyService);
    this.replOptions = this._register(
      this.instantiationService.createInstance(
        ReplOptions,
        this.id,
        () => this.getLocationBasedColors().background
      )
    );
    this._register(
      this.replOptions.onDidChange(() => this.onDidStyleChange())
    );
    codeEditorService.registerDecorationType(
      "repl-decoration",
      DECORATION_KEY,
      {}
    );
    this.multiSessionRepl.set(this.isMultiSessionView);
    this.registerListeners();
  }
  static {
    __name(this, "Repl");
  }
  static REFRESH_DELAY = 50;
  // delay in ms to refresh the repl for new elements to show
  static URI = uri.parse(`${DEBUG_SCHEME}:replinput`);
  history;
  tree;
  replOptions;
  previousTreeScrollHeight = 0;
  replDelegate;
  container;
  treeContainer;
  replInput;
  replInputContainer;
  bodyContentDimension;
  replInputLineCount = 1;
  model;
  setHistoryNavigationEnablement;
  scopedInstantiationService;
  replElementsChangeListener;
  styleElement;
  styleChangedWhenInvisible = false;
  completionItemProvider;
  modelChangeListener = Disposable.None;
  filter;
  multiSessionRepl;
  menu;
  replDataSource;
  findIsOpen = false;
  registerListeners() {
    if (this.debugService.getViewModel().focusedSession) {
      this.onDidFocusSession(
        this.debugService.getViewModel().focusedSession
      );
    }
    this._register(
      this.debugService.getViewModel().onDidFocusSession(
        async (session) => this.onDidFocusSession(session)
      )
    );
    this._register(
      this.debugService.getViewModel().onDidEvaluateLazyExpression(async (e) => {
        if (e instanceof Variable && this.tree?.hasNode(e)) {
          await this.tree.updateChildren(e, false, true);
          await this.tree.expand(e);
        }
      })
    );
    this._register(
      this.debugService.onWillNewSession(async (newSession) => {
        const input = this.tree?.getInput();
        if (!input || input.state === State.Inactive) {
          await this.selectSession(newSession);
        }
        this.multiSessionRepl.set(this.isMultiSessionView);
      })
    );
    this._register(
      this.debugService.onDidEndSession(async () => {
        await Promise.resolve();
        this.multiSessionRepl.set(this.isMultiSessionView);
      })
    );
    this._register(
      this.themeService.onDidColorThemeChange(() => {
        this.refreshReplElements(false);
        if (this.isVisible()) {
          this.updateInputDecoration();
        }
      })
    );
    this._register(
      this.onDidChangeBodyVisibility((visible) => {
        if (visible) {
          if (!this.model) {
            this.model = this.modelService.getModel(Repl.URI) || this.modelService.createModel(
              "",
              null,
              Repl.URI,
              true
            );
          }
          this.setMode();
          this.replInput.setModel(this.model);
          this.updateInputDecoration();
          this.refreshReplElements(true);
          if (this.styleChangedWhenInvisible) {
            this.styleChangedWhenInvisible = false;
            this.onDidStyleChange();
          }
        }
      })
    );
    this._register(
      this.configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("debug.console.wordWrap") && this.tree) {
          this.tree.dispose();
          this.treeContainer.innerText = "";
          dom.clearNode(this.treeContainer);
          this.createReplTree();
        }
        if (e.affectsConfiguration(
          "debug.console.acceptSuggestionOnEnter"
        )) {
          const config = this.configurationService.getValue(
            "debug"
          );
          this.replInput.updateOptions({
            acceptSuggestionOnEnter: config.console.acceptSuggestionOnEnter === "on" ? "on" : "off"
          });
        }
      })
    );
    this._register(
      this.editorService.onDidActiveEditorChange(() => {
        this.setMode();
      })
    );
    this._register(
      this.filterWidget.onDidChangeFilterText(() => {
        this.filter.filterQuery = this.filterWidget.getFilterText();
        if (this.tree) {
          this.tree.refilter();
          revealLastElement(this.tree);
        }
      })
    );
  }
  async onDidFocusSession(session) {
    if (session) {
      sessionsToIgnore.delete(session);
      this.completionItemProvider?.dispose();
      if (session.capabilities.supportsCompletionsRequest) {
        this.completionItemProvider = this.languageFeaturesService.completionProvider.register(
          {
            scheme: DEBUG_SCHEME,
            pattern: "**/replinput",
            hasAccessToAllModels: true
          },
          {
            _debugDisplayName: "debugConsole",
            triggerCharacters: session.capabilities.completionTriggerCharacters || ["."],
            provideCompletionItems: /* @__PURE__ */ __name(async (_, position, _context, token) => {
              this.setHistoryNavigationEnablement(false);
              const model = this.replInput.getModel();
              if (model) {
                const word = model.getWordAtPosition(position);
                const overwriteBefore = word ? word.word.length : 0;
                const text = model.getValue();
                const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
                const frameId = focusedStackFrame ? focusedStackFrame.frameId : void 0;
                const response = await session.completions(
                  frameId,
                  focusedStackFrame?.thread.threadId || 0,
                  text,
                  position,
                  overwriteBefore,
                  token
                );
                const suggestions = [];
                const computeRange = /* @__PURE__ */ __name((length) => Range.fromPositions(
                  position.delta(0, -length),
                  position
                ), "computeRange");
                if (response && response.body && response.body.targets) {
                  response.body.targets.forEach(
                    (item) => {
                      if (item && item.label) {
                        let insertTextRules;
                        let insertText = item.text || item.label;
                        if (typeof item.selectionStart === "number") {
                          insertTextRules = CompletionItemInsertTextRule.InsertAsSnippet;
                          const selectionLength = typeof item.selectionLength === "number" ? item.selectionLength : 0;
                          const placeholder = selectionLength > 0 ? "${1:" + insertText.substring(
                            item.selectionStart,
                            item.selectionStart + selectionLength
                          ) + "}$0" : "$0";
                          insertText = insertText.substring(
                            0,
                            item.selectionStart
                          ) + placeholder + insertText.substring(
                            item.selectionStart + selectionLength
                          );
                        }
                        suggestions.push({
                          label: item.label,
                          insertText,
                          detail: item.detail,
                          kind: CompletionItemKinds.fromString(
                            item.type || "property"
                          ),
                          filterText: item.start && item.length ? text.substring(
                            item.start,
                            item.start + item.length
                          ).concat(
                            item.label
                          ) : void 0,
                          range: computeRange(
                            item.length || overwriteBefore
                          ),
                          sortText: item.sortText,
                          insertTextRules
                        });
                      }
                    }
                  );
                }
                if (this.configurationService.getValue(
                  "debug"
                ).console.historySuggestions) {
                  const history = this.history.getHistory();
                  const idxLength = String(
                    history.length
                  ).length;
                  history.forEach(
                    (h, i) => suggestions.push({
                      label: h,
                      insertText: h,
                      kind: CompletionItemKind.Text,
                      range: computeRange(h.length),
                      sortText: "ZZZ" + String(
                        history.length - i
                      ).padStart(idxLength, "0")
                    })
                  );
                }
                return { suggestions };
              }
              return Promise.resolve({ suggestions: [] });
            }, "provideCompletionItems")
          }
        );
      }
    }
    await this.selectSession();
  }
  getFilterStats() {
    return {
      total: this.tree?.getNode().children.length ?? 0,
      filtered: this.tree?.getNode().children.filter((c) => c.visible).length ?? 0
    };
  }
  get isReadonly() {
    const session = this.tree?.getInput();
    if (session && session.state !== State.Inactive) {
      return false;
    }
    return true;
  }
  showPreviousValue() {
    if (!this.isReadonly) {
      this.navigateHistory(true);
    }
  }
  showNextValue() {
    if (!this.isReadonly) {
      this.navigateHistory(false);
    }
  }
  focusFilter() {
    this.filterWidget.focus();
  }
  openFind() {
    this.tree?.openFind();
  }
  setMode() {
    if (!this.isVisible()) {
      return;
    }
    const activeEditorControl = this.editorService.activeTextEditorControl;
    if (isCodeEditor(activeEditorControl)) {
      this.modelChangeListener.dispose();
      this.modelChangeListener = activeEditorControl.onDidChangeModelLanguage(
        () => this.setMode()
      );
      if (this.model && activeEditorControl.hasModel()) {
        this.model.setLanguage(
          activeEditorControl.getModel().getLanguageId()
        );
      }
    }
  }
  onDidStyleChange() {
    if (!this.isVisible()) {
      this.styleChangedWhenInvisible = true;
      return;
    }
    if (this.styleElement) {
      this.replInput.updateOptions({
        fontSize: this.replOptions.replConfiguration.fontSize,
        lineHeight: this.replOptions.replConfiguration.lineHeight,
        fontFamily: this.replOptions.replConfiguration.fontFamily === "default" ? EDITOR_FONT_DEFAULTS.fontFamily : this.replOptions.replConfiguration.fontFamily
      });
      const replInputLineHeight = this.replInput.getOption(
        EditorOption.lineHeight
      );
      this.styleElement.textContent = `
				.repl .repl-input-wrapper .repl-input-chevron {
					line-height: ${replInputLineHeight}px
				}

				.repl .repl-input-wrapper .monaco-editor .lines-content {
					background-color: ${this.replOptions.replConfiguration.backgroundColor};
				}
			`;
      const cssFontFamily = this.replOptions.replConfiguration.fontFamily === "default" ? "var(--monaco-monospace-font)" : this.replOptions.replConfiguration.fontFamily;
      this.container.style.setProperty(
        `--vscode-repl-font-family`,
        cssFontFamily
      );
      this.container.style.setProperty(
        `--vscode-repl-font-size`,
        `${this.replOptions.replConfiguration.fontSize}px`
      );
      this.container.style.setProperty(
        `--vscode-repl-font-size-for-twistie`,
        `${this.replOptions.replConfiguration.fontSizeForTwistie}px`
      );
      this.container.style.setProperty(
        `--vscode-repl-line-height`,
        this.replOptions.replConfiguration.cssLineHeight
      );
      this.tree?.rerender();
      if (this.bodyContentDimension) {
        this.layoutBodyContent(
          this.bodyContentDimension.height,
          this.bodyContentDimension.width
        );
      }
    }
  }
  navigateHistory(previous) {
    const historyInput = (previous ? this.history.previous() ?? this.history.first() : this.history.next()) ?? "";
    this.replInput.setValue(historyInput);
    aria.status(historyInput);
    this.replInput.setPosition({
      lineNumber: 1,
      column: historyInput.length + 1
    });
    this.setHistoryNavigationEnablement(true);
  }
  async selectSession(session) {
    const treeInput = this.tree?.getInput();
    if (!session) {
      const focusedSession = this.debugService.getViewModel().focusedSession;
      if (focusedSession) {
        session = focusedSession;
      } else if (!treeInput || sessionsToIgnore.has(treeInput)) {
        session = this.debugService.getModel().getSessions(true).find((s) => !sessionsToIgnore.has(s));
      }
    }
    if (session) {
      this.replElementsChangeListener?.dispose();
      this.replElementsChangeListener = session.onDidChangeReplElements(
        () => {
          this.refreshReplElements(
            session.getReplElements().length === 0
          );
        }
      );
      if (this.tree && treeInput !== session) {
        try {
          await this.tree.setInput(session);
        } catch (err) {
          this.logService.error(err);
        }
        revealLastElement(this.tree);
      }
    }
    this.replInput?.updateOptions({ readOnly: this.isReadonly });
    this.updateInputDecoration();
  }
  async clearRepl() {
    const session = this.tree?.getInput();
    if (session) {
      session.removeReplExpressions();
      if (session.state === State.Inactive) {
        sessionsToIgnore.add(session);
        await this.selectSession();
        this.multiSessionRepl.set(this.isMultiSessionView);
      }
    }
    this.replInput.focus();
  }
  acceptReplInput() {
    const session = this.tree?.getInput();
    if (session && !this.isReadonly) {
      session.addReplExpression(
        this.debugService.getViewModel().focusedStackFrame,
        this.replInput.getValue()
      );
      revealLastElement(this.tree);
      this.history.add(this.replInput.getValue());
      this.replInput.setValue("");
      const shouldRelayout = this.replInputLineCount > 1;
      this.replInputLineCount = 1;
      if (shouldRelayout && this.bodyContentDimension) {
        this.layoutBodyContent(
          this.bodyContentDimension.height,
          this.bodyContentDimension.width
        );
      }
    }
  }
  sendReplInput(input) {
    const session = this.tree?.getInput();
    if (session && !this.isReadonly) {
      session.addReplExpression(
        this.debugService.getViewModel().focusedStackFrame,
        input
      );
      revealLastElement(this.tree);
      this.history.add(input);
    }
  }
  getVisibleContent() {
    let text = "";
    if (this.model && this.tree) {
      const lineDelimiter = this.textResourcePropertiesService.getEOL(
        this.model.uri
      );
      const traverseAndAppend = /* @__PURE__ */ __name((node) => {
        node.children.forEach((child) => {
          if (child.visible) {
            text += child.element.toString().trimEnd() + lineDelimiter;
            if (!child.collapsed && child.children.length) {
              traverseAndAppend(child);
            }
          }
        });
      }, "traverseAndAppend");
      traverseAndAppend(this.tree.getNode());
    }
    return removeAnsiEscapeCodes(text);
  }
  layoutBodyContent(height, width) {
    this.bodyContentDimension = new dom.Dimension(width, height);
    const replInputHeight = Math.min(
      this.replInput.getContentHeight(),
      height
    );
    if (this.tree) {
      const lastElementVisible = this.tree.scrollTop + this.tree.renderHeight >= this.tree.scrollHeight;
      const treeHeight = height - replInputHeight;
      this.tree.getHTMLElement().style.height = `${treeHeight}px`;
      this.tree.layout(treeHeight, width);
      if (lastElementVisible) {
        revealLastElement(this.tree);
      }
    }
    this.replInputContainer.style.height = `${replInputHeight}px`;
    this.replInput.layout({ width: width - 30, height: replInputHeight });
  }
  collapseAll() {
    this.tree?.collapseAll();
  }
  getDebugSession() {
    return this.tree?.getInput();
  }
  getReplInput() {
    return this.replInput;
  }
  getReplDataSource() {
    return this.replDataSource;
  }
  getFocusedElement() {
    return this.tree?.getFocus()?.[0];
  }
  focusTree() {
    this.tree?.domFocus();
  }
  focus() {
    super.focus();
    setTimeout(() => this.replInput.focus(), 0);
  }
  getActionViewItem(action) {
    if (action.id === selectReplCommandId) {
      const session = (this.tree ? this.tree.getInput() : void 0) ?? this.debugService.getViewModel().focusedSession;
      return this.instantiationService.createInstance(
        SelectReplActionViewItem,
        action,
        session
      );
    }
    return super.getActionViewItem(action);
  }
  get isMultiSessionView() {
    return this.debugService.getModel().getSessions(true).filter((s) => s.hasSeparateRepl() && !sessionsToIgnore.has(s)).length > 1;
  }
  get refreshScheduler() {
    const autoExpanded = /* @__PURE__ */ new Set();
    return new RunOnceScheduler(async () => {
      if (!this.tree) {
        return;
      }
      if (!this.tree.getInput()) {
        return;
      }
      await this.tree.updateChildren(void 0, true, false, {
        diffIdentityProvider: identityProvider
      });
      const session = this.tree.getInput();
      if (session) {
        const autoExpandElements = /* @__PURE__ */ __name(async (elements) => {
          for (const element of elements) {
            if (element instanceof ReplGroup) {
              if (element.autoExpand && !autoExpanded.has(element.getId())) {
                autoExpanded.add(element.getId());
                await this.tree.expand(element);
              }
              if (!this.tree.isCollapsed(element)) {
                await autoExpandElements(element.getChildren());
              }
            }
          }
        }, "autoExpandElements");
        await autoExpandElements(session.getReplElements());
      }
      const { total, filtered } = this.getFilterStats();
      this.filterWidget.updateBadge(
        total === filtered || total === 0 ? void 0 : localize(
          "showing filtered repl lines",
          "Showing {0} of {1}",
          filtered,
          total
        )
      );
    }, Repl.REFRESH_DELAY);
  }
  // --- Creation
  render() {
    super.render();
    this._register(
      registerNavigableContainer({
        name: "repl",
        focusNotifiers: [this, this.filterWidget],
        focusNextWidget: /* @__PURE__ */ __name(() => {
          const element = this.tree?.getHTMLElement();
          if (this.filterWidget.hasFocus()) {
            this.tree?.domFocus();
          } else if (element && dom.isActiveElement(element)) {
            this.focus();
          }
        }, "focusNextWidget"),
        focusPreviousWidget: /* @__PURE__ */ __name(() => {
          const element = this.tree?.getHTMLElement();
          if (this.replInput.hasTextFocus()) {
            this.tree?.domFocus();
          } else if (element && dom.isActiveElement(element)) {
            this.focusFilter();
          }
        }, "focusPreviousWidget")
      })
    );
  }
  renderBody(parent) {
    super.renderBody(parent);
    this.container = dom.append(parent, $(".repl"));
    this.treeContainer = dom.append(
      this.container,
      $(`.repl-tree.${MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`)
    );
    this.createReplInput(this.container);
    this.createReplTree();
  }
  createReplTree() {
    this.replDelegate = new ReplDelegate(
      this.configurationService,
      this.replOptions
    );
    const wordWrap = this.configurationService.getValue("debug").console.wordWrap;
    this.treeContainer.classList.toggle("word-wrap", wordWrap);
    const expressionRenderer = this.instantiationService.createInstance(
      DebugExpressionRenderer
    );
    this.replDataSource = new ReplDataSource();
    const tree = this.tree = this.instantiationService.createInstance(
      WorkbenchAsyncDataTree,
      "DebugRepl",
      this.treeContainer,
      this.replDelegate,
      [
        this.instantiationService.createInstance(
          ReplVariablesRenderer,
          expressionRenderer
        ),
        this.instantiationService.createInstance(
          ReplOutputElementRenderer,
          expressionRenderer
        ),
        new ReplEvaluationInputsRenderer(),
        this.instantiationService.createInstance(
          ReplGroupRenderer,
          expressionRenderer
        ),
        new ReplEvaluationResultsRenderer(expressionRenderer),
        new ReplRawObjectsRenderer(expressionRenderer)
      ],
      this.replDataSource,
      {
        filter: this.filter,
        accessibilityProvider: new ReplAccessibilityProvider(),
        identityProvider,
        mouseSupport: false,
        findWidgetEnabled: true,
        keyboardNavigationLabelProvider: {
          getKeyboardNavigationLabel: /* @__PURE__ */ __name((e) => e.toString(true), "getKeyboardNavigationLabel")
        },
        horizontalScrolling: !wordWrap,
        setRowLineHeight: false,
        supportDynamicHeights: wordWrap,
        overrideStyles: this.getLocationBasedColors().listOverrideStyles
      }
    );
    this._register(
      tree.onDidChangeContentHeight(() => {
        if (tree.scrollHeight !== this.previousTreeScrollHeight) {
          const lastElementWasVisible = tree.scrollTop + tree.renderHeight >= this.previousTreeScrollHeight - 2;
          if (lastElementWasVisible) {
            setTimeout(() => {
              revealLastElement(tree);
            }, 0);
          }
        }
        this.previousTreeScrollHeight = tree.scrollHeight;
      })
    );
    this._register(tree.onContextMenu((e) => this.onContextMenu(e)));
    this._register(
      tree.onDidChangeFindOpenState((open) => this.findIsOpen = open)
    );
    let lastSelectedString;
    this._register(
      tree.onMouseClick(() => {
        if (this.findIsOpen) {
          return;
        }
        const selection = dom.getWindow(this.treeContainer).getSelection();
        if (!selection || selection.type !== "Range" || lastSelectedString === selection.toString()) {
          this.replInput.focus();
        }
        lastSelectedString = selection ? selection.toString() : "";
      })
    );
    this.selectSession();
    this.styleElement = dom.createStyleSheet(this.container);
    this.onDidStyleChange();
  }
  createReplInput(container) {
    this.replInputContainer = dom.append(
      container,
      $(".repl-input-wrapper")
    );
    dom.append(
      this.replInputContainer,
      $(
        ".repl-input-chevron" + ThemeIcon.asCSSSelector(debugConsoleEvaluationPrompt)
      )
    );
    const {
      historyNavigationBackwardsEnablement,
      historyNavigationForwardsEnablement
    } = this._register(
      registerAndCreateHistoryNavigationContext(
        this.scopedContextKeyService,
        this
      )
    );
    this.setHistoryNavigationEnablement = (enabled) => {
      historyNavigationBackwardsEnablement.set(enabled);
      historyNavigationForwardsEnablement.set(enabled);
    };
    CONTEXT_IN_DEBUG_REPL.bindTo(this.scopedContextKeyService).set(true);
    this.scopedInstantiationService = this._register(
      this.instantiationService.createChild(
        new ServiceCollection([
          IContextKeyService,
          this.scopedContextKeyService
        ])
      )
    );
    const options = getSimpleEditorOptions(this.configurationService);
    options.readOnly = true;
    options.suggest = { showStatusBar: true };
    const config = this.configurationService.getValue("debug");
    options.acceptSuggestionOnEnter = config.console.acceptSuggestionOnEnter === "on" ? "on" : "off";
    options.ariaLabel = this.getAriaLabel();
    this.replInput = this.scopedInstantiationService.createInstance(
      CodeEditorWidget,
      this.replInputContainer,
      options,
      getSimpleCodeEditorWidgetOptions()
    );
    this._register(
      this.replInput.onDidChangeModelContent(() => {
        const model = this.replInput.getModel();
        this.setHistoryNavigationEnablement(
          !!model && model.getValue() === ""
        );
        const lineCount = model ? Math.min(10, model.getLineCount()) : 1;
        if (lineCount !== this.replInputLineCount) {
          this.replInputLineCount = lineCount;
          if (this.bodyContentDimension) {
            this.layoutBodyContent(
              this.bodyContentDimension.height,
              this.bodyContentDimension.width
            );
          }
        }
      })
    );
    this._register(
      this.replInput.onDidFocusEditorText(
        () => this.updateInputDecoration()
      )
    );
    this._register(
      this.replInput.onDidBlurEditorText(
        () => this.updateInputDecoration()
      )
    );
    this._register(
      dom.addStandardDisposableListener(
        this.replInputContainer,
        dom.EventType.FOCUS,
        () => this.replInputContainer.classList.add("synthetic-focus")
      )
    );
    this._register(
      dom.addStandardDisposableListener(
        this.replInputContainer,
        dom.EventType.BLUR,
        () => this.replInputContainer.classList.remove("synthetic-focus")
      )
    );
  }
  getAriaLabel() {
    let ariaLabel = localize("debugConsole", "Debug Console");
    if (!this.configurationService.getValue(
      AccessibilityVerbositySettingId.Debug
    )) {
      return ariaLabel;
    }
    const keybinding = this.keybindingService.lookupKeybinding(AccessibilityCommandId.OpenAccessibilityHelp)?.getAriaLabel();
    if (keybinding) {
      ariaLabel = localize(
        "commentLabelWithKeybinding",
        "{0}, use ({1}) for accessibility help",
        ariaLabel,
        keybinding
      );
    } else {
      ariaLabel = localize(
        "commentLabelWithKeybindingNoKeybinding",
        "{0}, run the command Open Accessibility Help which is currently not triggerable via keybinding.",
        ariaLabel
      );
    }
    return ariaLabel;
  }
  onContextMenu(e) {
    const actions = [];
    createAndFillInContextMenuActions(
      this.menu,
      { arg: e.element, shouldForwardArgs: false },
      actions
    );
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => actions, "getActions"),
      getActionsContext: /* @__PURE__ */ __name(() => e.element, "getActionsContext")
    });
  }
  // --- Update
  refreshReplElements(noDelay) {
    if (this.tree && this.isVisible()) {
      if (this.refreshScheduler.isScheduled()) {
        return;
      }
      this.refreshScheduler.schedule(noDelay ? 0 : void 0);
    }
  }
  updateInputDecoration() {
    if (!this.replInput) {
      return;
    }
    const decorations = [];
    if (this.isReadonly && this.replInput.hasTextFocus() && !this.replInput.getValue()) {
      const transparentForeground = resolveColorValue(
        editorForeground,
        this.themeService.getColorTheme()
      )?.transparent(0.4);
      decorations.push({
        range: {
          startLineNumber: 0,
          endLineNumber: 0,
          startColumn: 0,
          endColumn: 1
        },
        renderOptions: {
          after: {
            contentText: localize(
              "startDebugFirst",
              "Please start a debug session to evaluate expressions"
            ),
            color: transparentForeground ? transparentForeground.toString() : void 0
          }
        }
      });
    }
    this.replInput.setDecorationsByType(
      "repl-decoration",
      DECORATION_KEY,
      decorations
    );
  }
  saveState() {
    const replHistory = this.history.getHistory();
    if (replHistory.length) {
      this.storageService.store(
        HISTORY_STORAGE_KEY,
        JSON.stringify(replHistory),
        StorageScope.WORKSPACE,
        StorageTarget.MACHINE
      );
    } else {
      this.storageService.remove(
        HISTORY_STORAGE_KEY,
        StorageScope.WORKSPACE
      );
    }
    const filterHistory = this.filterWidget.getHistory();
    if (filterHistory.length) {
      this.storageService.store(
        FILTER_HISTORY_STORAGE_KEY,
        JSON.stringify(filterHistory),
        StorageScope.WORKSPACE,
        StorageTarget.MACHINE
      );
    } else {
      this.storageService.remove(
        FILTER_HISTORY_STORAGE_KEY,
        StorageScope.WORKSPACE
      );
    }
    const filterValue = this.filterWidget.getFilterText();
    if (filterValue) {
      this.storageService.store(
        FILTER_VALUE_STORAGE_KEY,
        filterValue,
        StorageScope.WORKSPACE,
        StorageTarget.MACHINE
      );
    } else {
      this.storageService.remove(
        FILTER_VALUE_STORAGE_KEY,
        StorageScope.WORKSPACE
      );
    }
    super.saveState();
  }
  dispose() {
    this.replInput?.dispose();
    this.replElementsChangeListener?.dispose();
    this.refreshScheduler.dispose();
    this.modelChangeListener.dispose();
    super.dispose();
  }
};
__decorateClass([
  memoize
], Repl.prototype, "refreshScheduler", 1);
Repl = __decorateClass([
  __decorateParam(1, IDebugService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IModelService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, ICodeEditorService),
  __decorateParam(8, IViewDescriptorService),
  __decorateParam(9, IContextMenuService),
  __decorateParam(10, IConfigurationService),
  __decorateParam(11, ITextResourcePropertiesService),
  __decorateParam(12, IEditorService),
  __decorateParam(13, IKeybindingService),
  __decorateParam(14, IOpenerService),
  __decorateParam(15, ITelemetryService),
  __decorateParam(16, IHoverService),
  __decorateParam(17, IMenuService),
  __decorateParam(18, ILanguageFeaturesService),
  __decorateParam(19, ILogService)
], Repl);
let ReplOptions = class extends Disposable {
  constructor(viewId, backgroundColorDelegate, configurationService, themeService, viewDescriptorService) {
    super();
    this.backgroundColorDelegate = backgroundColorDelegate;
    this.configurationService = configurationService;
    this.themeService = themeService;
    this.viewDescriptorService = viewDescriptorService;
    this._register(
      this.themeService.onDidColorThemeChange((e) => this.update())
    );
    this._register(
      this.viewDescriptorService.onDidChangeLocation((e) => {
        if (e.views.some((v) => v.id === viewId)) {
          this.update();
        }
      })
    );
    this._register(
      this.configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("debug.console.lineHeight") || e.affectsConfiguration("debug.console.fontSize") || e.affectsConfiguration("debug.console.fontFamily")) {
          this.update();
        }
      })
    );
    this.update();
  }
  static {
    __name(this, "ReplOptions");
  }
  static lineHeightEm = 1.4;
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  _replConfig;
  get replConfiguration() {
    return this._replConfig;
  }
  update() {
    const debugConsole = this.configurationService.getValue(
      "debug"
    ).console;
    this._replConfig = {
      fontSize: debugConsole.fontSize,
      fontFamily: debugConsole.fontFamily,
      lineHeight: debugConsole.lineHeight ? debugConsole.lineHeight : ReplOptions.lineHeightEm * debugConsole.fontSize,
      cssLineHeight: debugConsole.lineHeight ? `${debugConsole.lineHeight}px` : `${ReplOptions.lineHeightEm}em`,
      backgroundColor: this.themeService.getColorTheme().getColor(this.backgroundColorDelegate()),
      fontSizeForTwistie: debugConsole.fontSize * ReplOptions.lineHeightEm / 2 - 8
    };
    this._onDidChange.fire();
  }
};
ReplOptions = __decorateClass([
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IViewDescriptorService)
], ReplOptions);
class AcceptReplInputAction extends EditorAction {
  static {
    __name(this, "AcceptReplInputAction");
  }
  constructor() {
    super({
      id: "repl.action.acceptInput",
      label: localize(
        {
          key: "actions.repl.acceptInput",
          comment: ["Apply input from the debug console input box"]
        },
        "Debug Console: Accept Input"
      ),
      alias: "Debug Console: Accept Input",
      precondition: CONTEXT_IN_DEBUG_REPL,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: KeyCode.Enter,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  run(accessor, editor) {
    SuggestController.get(editor)?.cancelSuggestWidget();
    const repl = getReplView(accessor.get(IViewsService));
    repl?.acceptReplInput();
  }
}
class FilterReplAction extends ViewAction {
  static {
    __name(this, "FilterReplAction");
  }
  constructor() {
    super({
      viewId: REPL_VIEW_ID,
      id: "repl.action.filter",
      title: localize(
        "repl.action.filter",
        "Debug Console: Focus Filter"
      ),
      precondition: CONTEXT_IN_DEBUG_REPL,
      keybinding: [
        {
          when: EditorContextKeys.textInputFocus,
          primary: KeyMod.CtrlCmd | KeyCode.KeyF,
          weight: KeybindingWeight.EditorContrib
        }
      ]
    });
  }
  runInView(accessor, repl) {
    repl.focusFilter();
  }
}
class FindReplAction extends ViewAction {
  static {
    __name(this, "FindReplAction");
  }
  constructor() {
    super({
      viewId: REPL_VIEW_ID,
      id: "repl.action.find",
      title: localize("repl.action.find", "Debug Console: Focus Find"),
      precondition: CONTEXT_IN_DEBUG_REPL,
      keybinding: [
        {
          when: ContextKeyExpr.or(
            CONTEXT_IN_DEBUG_REPL,
            ContextKeyExpr.equals(
              "focusedView",
              "workbench.panel.repl.view"
            )
          ),
          primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyF,
          weight: KeybindingWeight.EditorContrib
        }
      ],
      icon: Codicon.search,
      menu: [
        {
          id: MenuId.ViewTitle,
          group: "navigation",
          when: ContextKeyExpr.equals("view", REPL_VIEW_ID),
          order: 15
        },
        {
          id: MenuId.DebugConsoleContext,
          group: "z_commands",
          order: 25
        }
      ]
    });
  }
  runInView(accessor, view) {
    view.openFind();
  }
}
class ReplCopyAllAction extends EditorAction {
  static {
    __name(this, "ReplCopyAllAction");
  }
  constructor() {
    super({
      id: "repl.action.copyAll",
      label: localize("actions.repl.copyAll", "Debug: Console Copy All"),
      alias: "Debug Console Copy All",
      precondition: CONTEXT_IN_DEBUG_REPL
    });
  }
  run(accessor, editor) {
    const clipboardService = accessor.get(IClipboardService);
    const repl = getReplView(accessor.get(IViewsService));
    if (repl) {
      return clipboardService.writeText(repl.getVisibleContent());
    }
  }
}
registerEditorAction(AcceptReplInputAction);
registerEditorAction(ReplCopyAllAction);
registerAction2(FilterReplAction);
registerAction2(FindReplAction);
class SelectReplActionViewItem extends FocusSessionActionViewItem {
  static {
    __name(this, "SelectReplActionViewItem");
  }
  getSessions() {
    return this.debugService.getModel().getSessions(true).filter((s) => s.hasSeparateRepl() && !sessionsToIgnore.has(s));
  }
  mapFocusedSessionToSelected(focusedSession) {
    while (focusedSession.parentSession && !focusedSession.hasSeparateRepl()) {
      focusedSession = focusedSession.parentSession;
    }
    return focusedSession;
  }
}
function getReplView(viewsService) {
  return viewsService.getActiveViewWithId(REPL_VIEW_ID) ?? void 0;
}
__name(getReplView, "getReplView");
const selectReplCommandId = "workbench.action.debug.selectRepl";
registerAction2(
  class extends ViewAction {
    constructor() {
      super({
        id: selectReplCommandId,
        viewId: REPL_VIEW_ID,
        title: localize("selectRepl", "Select Debug Console"),
        f1: false,
        menu: {
          id: MenuId.ViewTitle,
          group: "navigation",
          when: ContextKeyExpr.and(
            ContextKeyExpr.equals("view", REPL_VIEW_ID),
            CONTEXT_MULTI_SESSION_REPL
          ),
          order: 20
        }
      });
    }
    async runInView(accessor, view, session) {
      const debugService = accessor.get(IDebugService);
      if (session && session.state !== State.Inactive && session !== debugService.getViewModel().focusedSession) {
        if (session.state !== State.Stopped) {
          const stopppedChildSession = debugService.getModel().getSessions().find(
            (s) => s.parentSession === session && s.state === State.Stopped
          );
          if (stopppedChildSession) {
            session = stopppedChildSession;
          }
        }
        await debugService.focusStackFrame(
          void 0,
          void 0,
          session,
          { explicit: true }
        );
      }
      await view.selectSession(session);
    }
  }
);
registerAction2(
  class extends ViewAction {
    constructor() {
      super({
        id: "workbench.debug.panel.action.clearReplAction",
        viewId: REPL_VIEW_ID,
        title: localize2("clearRepl", "Clear Console"),
        metadata: {
          description: localize2(
            "clearRepl.descriotion",
            "Clears all program output from your debug REPL"
          )
        },
        f1: true,
        icon: debugConsoleClearAll,
        menu: [
          {
            id: MenuId.ViewTitle,
            group: "navigation",
            when: ContextKeyExpr.equals("view", REPL_VIEW_ID),
            order: 30
          },
          {
            id: MenuId.DebugConsoleContext,
            group: "z_commands",
            order: 20
          }
        ],
        keybinding: [
          {
            primary: 0,
            mac: { primary: KeyMod.CtrlCmd | KeyCode.KeyK },
            // Weight is higher than work workbench contributions so the keybinding remains
            // highest priority when chords are registered afterwards
            weight: KeybindingWeight.WorkbenchContrib + 1,
            when: ContextKeyExpr.equals(
              "focusedView",
              "workbench.panel.repl.view"
            )
          }
        ]
      });
    }
    runInView(_accessor, view) {
      const accessibilitySignalService = _accessor.get(
        IAccessibilitySignalService
      );
      view.clearRepl();
      accessibilitySignalService.playSignal(AccessibilitySignal.clear);
    }
  }
);
registerAction2(
  class extends ViewAction {
    constructor() {
      super({
        id: "debug.collapseRepl",
        title: localize("collapse", "Collapse All"),
        viewId: REPL_VIEW_ID,
        menu: {
          id: MenuId.DebugConsoleContext,
          group: "z_commands",
          order: 10
        }
      });
    }
    runInView(_accessor, view) {
      view.collapseAll();
      view.focus();
    }
  }
);
registerAction2(
  class extends ViewAction {
    constructor() {
      super({
        id: "debug.replPaste",
        title: localize("paste", "Paste"),
        viewId: REPL_VIEW_ID,
        precondition: CONTEXT_DEBUG_STATE.notEqualsTo(
          getStateLabel(State.Inactive)
        ),
        menu: {
          id: MenuId.DebugConsoleContext,
          group: "2_cutcopypaste",
          order: 30
        }
      });
    }
    async runInView(accessor, view) {
      const clipboardService = accessor.get(IClipboardService);
      const clipboardText = await clipboardService.readText();
      if (clipboardText) {
        const replInput = view.getReplInput();
        replInput.setValue(replInput.getValue().concat(clipboardText));
        view.focus();
        const model = replInput.getModel();
        const lineNumber = model ? model.getLineCount() : 0;
        const column = model?.getLineMaxColumn(lineNumber);
        if (typeof lineNumber === "number" && typeof column === "number") {
          replInput.setPosition({ lineNumber, column });
        }
      }
    }
  }
);
registerAction2(
  class extends ViewAction {
    constructor() {
      super({
        id: "workbench.debug.action.copyAll",
        title: localize("copyAll", "Copy All"),
        viewId: REPL_VIEW_ID,
        menu: {
          id: MenuId.DebugConsoleContext,
          group: "2_cutcopypaste",
          order: 20
        }
      });
    }
    async runInView(accessor, view) {
      const clipboardService = accessor.get(IClipboardService);
      await clipboardService.writeText(view.getVisibleContent());
    }
  }
);
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "debug.replCopy",
        title: localize("copy", "Copy"),
        menu: {
          id: MenuId.DebugConsoleContext,
          group: "2_cutcopypaste",
          order: 10
        }
      });
    }
    async run(accessor, element) {
      const clipboardService = accessor.get(IClipboardService);
      const debugService = accessor.get(IDebugService);
      const nativeSelection = dom.getActiveWindow().getSelection();
      const selectedText = nativeSelection?.toString();
      if (selectedText && selectedText.length > 0) {
        return clipboardService.writeText(selectedText);
      } else if (element) {
        return clipboardService.writeText(
          await this.tryEvaluateAndCopy(debugService, element) || element.toString()
        );
      }
    }
    async tryEvaluateAndCopy(debugService, element) {
      if (!(element instanceof ReplEvaluationResult)) {
        return;
      }
      const stackFrame = debugService.getViewModel().focusedStackFrame;
      const session = debugService.getViewModel().focusedSession;
      if (!stackFrame || !session || !session.capabilities.supportsClipboardContext) {
        return;
      }
      try {
        const evaluation = await session.evaluate(
          element.originalExpression,
          stackFrame.frameId,
          "clipboard"
        );
        return evaluation?.body.result;
      } catch (e) {
        return;
      }
    }
  }
);
export {
  Repl,
  getReplView
};
//# sourceMappingURL=repl.js.map
